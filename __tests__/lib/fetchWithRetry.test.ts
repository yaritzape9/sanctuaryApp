import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchWithRetry, isRetryableStatus } from "@/lib/fetchWithRetry";

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const response = (status: number) => ({ ok: status >= 200 && status < 300, status }) as Response;

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("isRetryableStatus", () => {
  it.each([408, 429, 500, 502, 503, 504])("retries %i", (status) => {
    expect(isRetryableStatus(status)).toBe(true);
  });

  it.each([400, 401, 403, 404, 409, 422])("does not retry %i", (status) => {
    expect(isRetryableStatus(status)).toBe(false);
  });
});

describe("fetchWithRetry", () => {
  it("returns the first response when it succeeds, without waiting", async () => {
    mockFetch.mockResolvedValueOnce(response(200));

    const res = await fetchWithRetry("/api/x");

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("passes the request through unchanged on every try", async () => {
    mockFetch.mockResolvedValueOnce(response(503)).mockResolvedValueOnce(response(200));
    const init = { method: "POST", body: "{}" };

    const promise = fetchWithRetry("/api/x", init);
    await vi.runAllTimersAsync();
    await promise;

    expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/x", init);
    expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/x", init);
  });

  it.each([401, 403, 400])("returns a %i right away without retrying", async (status) => {
    mockFetch.mockResolvedValueOnce(response(status));

    const res = await fetchWithRetry("/api/x");

    expect(res.status).toBe(status);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries a 5xx and returns the later success", async () => {
    mockFetch.mockResolvedValueOnce(response(502)).mockResolvedValueOnce(response(200));

    const promise = fetchWithRetry("/api/x");
    await vi.runAllTimersAsync();
    const res = await promise;

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("retries a network error and returns the later success", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch")).mockResolvedValueOnce(response(200));

    const promise = fetchWithRetry("/api/x");
    await vi.runAllTimersAsync();
    const res = await promise;

    expect(res.status).toBe(200);
  });

  it("waits longer before each retry (500 ms, then 1 s)", async () => {
    mockFetch.mockResolvedValue(response(503));

    const promise = fetchWithRetry("/api/x");
    await vi.advanceTimersByTimeAsync(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(499);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(999);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(mockFetch).toHaveBeenCalledTimes(3);

    await promise;
  });

  it("returns the last response once every try got a retryable status", async () => {
    mockFetch.mockResolvedValue(response(503));

    const promise = fetchWithRetry("/api/x");
    await vi.runAllTimersAsync();
    const res = await promise;

    expect(res.status).toBe(503);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("rejects with the last network error once every try failed to connect", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

    const promise = fetchWithRetry("/api/x");
    const assertion = expect(promise).rejects.toThrow("Failed to fetch");
    await vi.runAllTimersAsync();
    await assertion;

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("respects custom attempts and delay", async () => {
    mockFetch.mockResolvedValue(response(500));

    const promise = fetchWithRetry("/api/x", undefined, { attempts: 2, baseDelayMs: 10 });
    await vi.advanceTimersByTimeAsync(10);
    const res = await promise;

    expect(res.status).toBe(500);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

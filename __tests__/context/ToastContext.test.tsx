import { describe, it, expect, vi, afterEach } from "vitest";
import { render, renderHook, screen, act, cleanup, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { ToastProvider, useToast } from "@/context/ToastContext";

// Mirrors ReportModal: closes itself, then fires a toast after it has unmounted
function SelfClosingModal({ onClose }: { onClose: () => void }) {
  const { addToast } = useToast();
  return (
    <button
      onClick={() => {
        onClose();
        addToast("Sighting reported.", "success");
      }}
    >
      Submit
    </button>
  );
}

function ModalHost() {
  const [open, setOpen] = useState(true);
  return open ? <SelfClosingModal onClose={() => setOpen(false)} /> : null;
}

function AddButton({ message }: { message: string }) {
  const { addToast } = useToast();
  return <button onClick={() => addToast(message, "error")}>Add</button>;
}

describe("ToastContext", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows a toast added by a component that renders no container", () => {
    render(
      <ToastProvider>
        <AddButton message="Could not send alert after 3 tries." />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Add"));

    expect(screen.getByText("Could not send alert after 3 tries.")).toBeInTheDocument();
  });

  it("keeps a toast visible after the component that fired it unmounts", () => {
    render(
      <ToastProvider>
        <ModalHost />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Submit"));

    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
    expect(screen.getByText("Sighting reported.")).toBeInTheDocument();
  });

  it("auto-dismisses a toast after 4 seconds", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <AddButton message="Failed to load contacts." />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText("Add"));
    act(() => vi.advanceTimersByTime(3999));
    expect(screen.getByText("Failed to load contacts.")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("Failed to load contacts.")).not.toBeInTheDocument();
  });

  it("dismiss removes only the clicked toast", () => {
    function TwoToasts() {
      const { addToast } = useToast();
      return (
        <button
          onClick={() => {
            addToast("first", "info");
            addToast("second", "info");
          }}
        >
          Add two
        </button>
      );
    }
    render(
      <ToastProvider>
        <TwoToasts />
      </ToastProvider>
    );

    // Both are added in the same tick, so they'd collide if ids came from Date.now()
    fireEvent.click(screen.getByText("Add two"));
    fireEvent.click(screen.getAllByLabelText("Dismiss")[0]);

    expect(screen.queryByText("first")).not.toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });

  it("throws a clear error when used outside ToastProvider", () => {
    // React logs the thrown error; keep test output clean
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useToast())).toThrow(
      "useToast must be used inside <ToastProvider>"
    );
  });
});

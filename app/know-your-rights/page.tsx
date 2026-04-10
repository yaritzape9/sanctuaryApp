"use client"

import { useState } from "react"

type Lang = "en" | "es" | "zh" | "ar"

interface Right {
  num: string
  title: string
  body: string
}

interface LangContent {
  label: string
  title: string
  subtitle: string
  warnLabel: string
  warnText: string
  rights: Right[]
}

const translations: Record<Lang, LangContent> = {
  en: {
    label: "Know Your Rights",
    title: "You have rights. Use them.",
    subtitle:
      "Regardless of your immigration status, you have constitutional rights when interacting with ICE or law enforcement. Know them. Use them.",
    warnLabel: "Important",
    warnText:
      "Do not run. Do not physically resist. Calmly assert your rights. Everything you say can be used against you.",
    rights: [
      {
        num: "01",
        title: "Right to remain silent",
        body: "You do not have to answer questions about where you were born, how you entered the US, or your immigration status.",
      },
      {
        num: "02",
        title: "Right to refuse a search",
        body: "You can refuse to consent to a search of yourself or your home. Say clearly: 'I do not consent to this search.'",
      },
      {
        num: "03",
        title: "Right to an attorney",
        body: "You have the right to speak with a lawyer before answering questions. If arrested, say: 'I want a lawyer.'",
      },
      {
        num: "04",
        title: "Do not open the door",
        body: "ICE cannot enter your home without a warrant signed by a judge. Ask to see the warrant through the door.",
      },
      {
        num: "05",
        title: "Right to make a call",
        body: "If detained, you have the right to make a phone call. Call a lawyer or a trusted contact immediately.",
      },
      {
        num: "06",
        title: "Do not sign anything",
        body: "Do not sign any documents without first speaking to a lawyer. You may be waiving your rights.",
      },
    ],
  },
  es: {
    label: "Conozca Sus Derechos",
    title: "Usted tiene derechos. Úselos.",
    subtitle:
      "Sin importar su estatus migratorio, usted tiene derechos constitucionales al interactuar con ICE o la policía. Conózcalos. Úselos.",
    warnLabel: "Importante",
    warnText:
      "No huya. No oponga resistencia física. Afirme sus derechos con calma. Todo lo que diga puede ser usado en su contra.",
    rights: [
      {
        num: "01",
        title: "Derecho a guardar silencio",
        body: "No tiene que responder preguntas sobre dónde nació, cómo entró a EE.UU. ni su estatus migratorio.",
      },
      {
        num: "02",
        title: "Derecho a negarse a un registro",
        body: "Puede negarse a que registren su persona o su hogar. Diga claramente: 'No consiento este registro.'",
      },
      {
        num: "03",
        title: "Derecho a un abogado",
        body: "Tiene derecho a hablar con un abogado antes de responder preguntas. Si es arrestado, diga: 'Quiero un abogado.'",
      },
      {
        num: "04",
        title: "No abra la puerta",
        body: "ICE no puede entrar a su hogar sin una orden judicial firmada por un juez. Pida ver la orden desde adentro.",
      },
      {
        num: "05",
        title: "Derecho a hacer una llamada",
        body: "Si es detenido, tiene derecho a hacer una llamada. Llame a un abogado o a un contacto de confianza.",
      },
      {
        num: "06",
        title: "No firme nada",
        body: "No firme ningún documento sin hablar primero con un abogado. Puede estar renunciando a sus derechos.",
      },
    ],
  },
  zh: {
    label: "了解您的权利",
    title: "您有权利。请行使它们。",
    subtitle:
      "无论您的移民身份如何，在与移民执法局或执法人员打交道时，您都享有宪法权利。了解它们，使用它们。",
    warnLabel: "重要提示",
    warnText:
      "不要逃跑。不要进行身体抵抗。冷静地主张您的权利。您所说的一切都可能被用来对付您。",
    rights: [
      {
        num: "01",
        title: "保持沉默的权利",
        body: "您不必回答有关出生地、如何进入美国或移民身份的问题。",
      },
      {
        num: "02",
        title: "拒绝搜查的权利",
        body: "您可以拒绝对您本人或住所进行搜查。清楚地说：'我不同意这次搜查。'",
      },
      {
        num: "03",
        title: "获得律师帮助的权利",
        body: "在回答问题之前，您有权与律师交谈。如被捕，请说：'我要律师。'",
      },
      {
        num: "04",
        title: "不要开门",
        body: "没有法官签署的搜查令，移民执法局不得进入您的住所。请隔门查看搜查令。",
      },
      {
        num: "05",
        title: "打电话的权利",
        body: "如果被拘留，您有权打电话。立即联系律师或可信赖的联系人。",
      },
      {
        num: "06",
        title: "不要签署任何文件",
        body: "未与律师交谈之前，不要签署任何文件，否则可能放弃您的权利。",
      },
    ],
  },
  ar: {
    label: "اعرف حقوقك",
    title: "لديك حقوق. استخدمها.",
    subtitle:
      "بغض النظر عن وضعك الهجري، لديك حقوق دستورية عند التعامل مع دائرة الهجرة أو قوات إنفاذ القانون. اعرفها واستخدمها.",
    warnLabel: "مهم",
    warnText:
      "لا تهرب. لا تقاوم جسدياً. أكد حقوقك بهدوء. كل ما تقوله يمكن استخدامه ضدك.",
    rights: [
      {
        num: "٠١",
        title: "حق التزام الصمت",
        body: "لست مضطراً للإجابة عن أسئلة تتعلق بمكان ولادتك أو كيفية دخولك الولايات المتحدة أو وضعك الهجري.",
      },
      {
        num: "٠٢",
        title: "حق رفض التفتيش",
        body: "يمكنك رفض الموافقة على تفتيش شخصك أو منزلك. قل بوضوح: 'لا أوافق على هذا التفتيش.'",
      },
      {
        num: "٠٣",
        title: "حق الاستعانة بمحامٍ",
        body: "يحق لك التحدث مع محامٍ قبل الإجابة عن أي أسئلة. إذا اعتُقلت قل: 'أريد محامياً.'",
      },
      {
        num: "٠٤",
        title: "لا تفتح الباب",
        body: "لا يحق لدائرة الهجرة دخول منزلك بدون أمر تفتيش موقّع من قاضٍ. اطلب رؤية الأمر من خلف الباب.",
      },
      {
        num: "٠٥",
        title: "حق إجراء مكالمة هاتفية",
        body: "إذا احتُجزت يحق لك إجراء مكالمة هاتفية. اتصل بمحامٍ أو شخص موثوق به فوراً.",
      },
      {
        num: "٠٦",
        title: "لا توقّع على أي شيء",
        body: "لا توقّع على أي وثيقة قبل التحدث مع محامٍ، فقد تتنازل عن حقوقك.",
      },
    ],
  },
}

const languages: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
]

export default function KnowYourRightsPage() {
  const [lang, setLang] = useState<Lang>("en")
  const d = translations[lang]
  const isRtl = lang === "ar"

  return (
    <main
      className="max-w-3xl mx-auto px-8 py-16 min-h-screen"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Language switcher */}
      <div className="flex gap-2 flex-wrap mb-12">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${
              lang === l.code
                ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                : "border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-500 dark:hover:border-gray-500"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Hero */}
      <div className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
          {d.label}
        </p>
        <h1 className="text-5xl font-bold tracking-tight leading-none mb-6">
          {d.title}
        </h1>
        <div className="w-12 h-px bg-gray-300 dark:bg-gray-700 mb-6" />
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
          {d.subtitle}
        </p>
      </div>

      {/* Warning box */}
      <div className="border border-red-200 dark:border-red-900 rounded-xl px-6 py-4 mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-red-400 mb-2">
          {d.warnLabel}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {d.warnText}
        </p>
      </div>

      {/* Rights grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {d.rights.map((right) => (
          <div
            key={right.num}
            className="border border-gray-200 dark:border-gray-800 rounded-xl px-6 py-5"
          >
            <p className="text-xs font-mono text-gray-400 dark:text-gray-600 mb-2">
              {right.num}
            </p>
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-2 leading-snug">
              {right.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {right.body}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
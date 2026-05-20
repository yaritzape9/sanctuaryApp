/**
 * TODO: Move translations to Spring Boot backend
 * - Create a `/api/translations/{lang}` endpoint that returns LangContent
 * - Store translations in a database so they can be updated without a deploy
 * - On the frontend, fetch translations dynamically based on selected lang:
 *     const res = await fetch(`/api/translations/${lang}`)
 *     const d: LangContent = await res.json()
 * - Remove this static file once the API is live
 * - Consider caching with Redis to avoid a DB hit on every language switch
 */
export type Lang = "en" | "es" | "zh" | "ar" | "vi" | "fr" | "ht" | "pt" | "hi" | "ko" | "tl" | "ru" | "pl"

export interface Right {
  num: string
  title: string
  body: string
}

export interface LangContent {
  label: string
  title: string
  subtitle: string
  warnLabel: string
  warnText: string
  rights: Right[]
}

export const translations: Record<Lang, LangContent> = {
  en: {
    label: "Know Your Rights",
    title: "You have rights. Use them.",
    subtitle:
      "Regardless of your immigration status, you have constitutional rights when interacting with ICE or law enforcement. Know them. Use them.",
    warnLabel: "Important",
    warnText:
      "Do not run. Do not physically resist. Calmly assert your rights. Everything you say can be used against you.",
    rights: [
      { num: "01", title: "Right to remain silent", body: "You do not have to answer questions about where you were born, how you entered the US, or your immigration status." },
      { num: "02", title: "Right to refuse a search", body: "You can refuse to consent to a search of yourself or your home. Say clearly: 'I do not consent to this search.'" },
      { num: "03", title: "Right to an attorney", body: "You have the right to speak with a lawyer before answering questions. If arrested, say: 'I want a lawyer.'" },
      { num: "04", title: "Do not open the door", body: "ICE cannot enter your home without a warrant signed by a judge. Ask to see the warrant through the door." },
      { num: "05", title: "Right to make a call", body: "If detained, you have the right to make a phone call. Call a lawyer or a trusted contact immediately." },
      { num: "06", title: "Do not sign anything", body: "Do not sign any documents without first speaking to a lawyer. You may be waiving your rights." },
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
      { num: "01", title: "Derecho a guardar silencio", body: "No tiene que responder preguntas sobre dónde nació, cómo entró a EE.UU. ni su estatus migratorio." },
      { num: "02", title: "Derecho a negarse a un registro", body: "Puede negarse a que registren su persona o su hogar. Diga claramente: 'No consiento este registro.'" },
      { num: "03", title: "Derecho a un abogado", body: "Tiene derecho a hablar con un abogado antes de responder preguntas. Si es arrestado, diga: 'Quiero un abogado.'" },
      { num: "04", title: "No abra la puerta", body: "ICE no puede entrar a su hogar sin una orden judicial firmada por un juez. Pida ver la orden desde adentro." },
      { num: "05", title: "Derecho a hacer una llamada", body: "Si es detenido, tiene derecho a hacer una llamada. Llame a un abogado o a un contacto de confianza." },
      { num: "06", title: "No firme nada", body: "No firme ningún documento sin hablar primero con un abogado. Puede estar renunciando a sus derechos." },
    ],
  },
  zh: {
    label: "了解您的权利",
    title: "您有权利。请行使它们。",
    subtitle: "无论您的移民身份如何，在与移民执法局或执法人员打交道时，您都享有宪法权利。了解它们，使用它们。",
    warnLabel: "重要提示",
    warnText: "不要逃跑。不要进行身体抵抗。冷静地主张您的权利。您所说的一切都可能被用来对付您。",
    rights: [
      { num: "01", title: "保持沉默的权利", body: "您不必回答有关出生地、如何进入美国或移民身份的问题。" },
      { num: "02", title: "拒绝搜查的权利", body: "您可以拒绝对您本人或住所进行搜查。清楚地说：'我不同意这次搜查。'" },
      { num: "03", title: "获得律师帮助的权利", body: "在回答问题之前，您有权与律师交谈。如被捕，请说：'我要律师。'" },
      { num: "04", title: "不要开门", body: "没有法官签署的搜查令，移民执法局不得进入您的住所。请隔门查看搜查令。" },
      { num: "05", title: "打电话的权利", body: "如果被拘留，您有权打电话。立即联系律师或可信赖的联系人。" },
      { num: "06", title: "不要签署任何文件", body: "未与律师交谈之前，不要签署任何文件，否则可能放弃您的权利。" },
    ],
  },
  ar: {
    label: "اعرف حقوقك",
    title: "لديك حقوق. استخدمها.",
    subtitle: "بغض النظر عن وضعك الهجري، لديك حقوق دستورية عند التعامل مع دائرة الهجرة أو قوات إنفاذ القانون. اعرفها واستخدمها.",
    warnLabel: "مهم",
    warnText: "لا تهرب. لا تقاوم جسدياً. أكد حقوقك بهدوء. كل ما تقوله يمكن استخدامه ضدك.",
    rights: [
      { num: "٠١", title: "حق التزام الصمت", body: "لست مضطراً للإجابة عن أسئلة تتعلق بمكان ولادتك أو كيفية دخولك الولايات المتحدة أو وضعك الهجري." },
      { num: "٠٢", title: "حق رفض التفتيش", body: "يمكنك رفض الموافقة على تفتيش شخصك أو منزلك. قل بوضوح: 'لا أوافق على هذا التفتيش.'" },
      { num: "٠٣", title: "حق الاستعانة بمحامٍ", body: "يحق لك التحدث مع محامٍ قبل الإجابة عن أي أسئلة. إذا اعتُقلت قل: 'أريد محامياً.'" },
      { num: "٠٤", title: "لا تفتح الباب", body: "لا يحق لدائرة الهجرة دخول منزلك بدون أمر تفتيش موقّع من قاضٍ. اطلب رؤية الأمر من خلف الباب." },
      { num: "٠٥", title: "حق إجراء مكالمة هاتفية", body: "إذا احتُجزت يحق لك إجراء مكالمة هاتفية. اتصل بمحامٍ أو شخص موثوق به فوراً." },
      { num: "٠٦", title: "لا توقّع على أي شيء", body: "لا توقّع على أي وثيقة قبل التحدث مع محامٍ، فقد تتنازل عن حقوقك." },
    ],
  },
  vi: {
    label: "Biết Quyền Của Bạn",
    title: "Bạn có quyền. Hãy sử dụng chúng.",
    subtitle: "Bất kể tình trạng nhập cư của bạn, bạn có quyền hiến pháp khi tiếp xúc với ICE hoặc cơ quan thực thi pháp luật. Hãy biết và sử dụng chúng.",
    warnLabel: "Quan trọng",
    warnText: "Không bỏ chạy. Không chống cự bằng thể lực. Bình tĩnh khẳng định quyền của bạn. Mọi điều bạn nói đều có thể được dùng chống lại bạn.",
    rights: [
      { num: "01", title: "Quyền im lặng", body: "Bạn không cần trả lời câu hỏi về nơi sinh, cách bạn vào Mỹ hoặc tình trạng nhập cư." },
      { num: "02", title: "Quyền từ chối khám xét", body: "Bạn có thể từ chối cho phép khám xét người hoặc nhà. Nói rõ: 'Tôi không đồng ý với cuộc khám xét này.'" },
      { num: "03", title: "Quyền có luật sư", body: "Bạn có quyền nói chuyện với luật sư trước khi trả lời câu hỏi. Nếu bị bắt, hãy nói: 'Tôi muốn có luật sư.'" },
      { num: "04", title: "Không mở cửa", body: "ICE không thể vào nhà bạn nếu không có lệnh của thẩm phán. Yêu cầu xem lệnh qua cửa." },
      { num: "05", title: "Quyền gọi điện", body: "Nếu bị giam giữ, bạn có quyền gọi điện. Hãy gọi cho luật sư hoặc người thân tin cậy ngay." },
      { num: "06", title: "Không ký bất cứ điều gì", body: "Không ký bất kỳ tài liệu nào khi chưa nói chuyện với luật sư. Bạn có thể đang từ bỏ quyền của mình." },
    ],
  },
  fr: {
    label: "Connaissez Vos Droits",
    title: "Vous avez des droits. Utilisez-les.",
    subtitle: "Quel que soit votre statut migratoire, vous avez des droits constitutionnels lors d'interactions avec l'ICE ou les forces de l'ordre. Connaissez-les. Utilisez-les.",
    warnLabel: "Important",
    warnText: "Ne fuyez pas. Ne résistez pas physiquement. Affirmez calmement vos droits. Tout ce que vous dites peut être utilisé contre vous.",
    rights: [
      { num: "01", title: "Droit de garder le silence", body: "Vous n'êtes pas obligé de répondre aux questions sur votre lieu de naissance, comment vous êtes entré aux États-Unis ou votre statut migratoire." },
      { num: "02", title: "Droit de refuser une fouille", body: "Vous pouvez refuser de consentir à une fouille de votre personne ou de votre domicile. Dites clairement: 'Je ne consens pas à cette fouille.'" },
      { num: "03", title: "Droit à un avocat", body: "Vous avez le droit de parler à un avocat avant de répondre aux questions. Si vous êtes arrêté, dites: 'Je veux un avocat.'" },
      { num: "04", title: "N'ouvrez pas la porte", body: "L'ICE ne peut pas entrer chez vous sans un mandat signé par un juge. Demandez à voir le mandat à travers la porte." },
      { num: "05", title: "Droit de passer un appel", body: "Si vous êtes détenu, vous avez le droit de passer un appel téléphonique. Appelez un avocat ou un contact de confiance immédiatement." },
      { num: "06", title: "Ne signez rien", body: "Ne signez aucun document sans avoir d'abord parlé à un avocat. Vous pourriez renoncer à vos droits." },
    ],
  },
  ht: {
    label: "Konnen Dwa Ou",
    title: "Ou gen dwa. Itilize yo.",
    subtitle: "Kèlkeswa estati imigrasyon ou, ou gen dwa konstitisyonèl lè w ap fè fas ak ICE oswa lapolis. Konnen yo. Itilize yo.",
    warnLabel: "Enpòtan",
    warnText: "Pa kouri. Pa reziste fizikman. Affirme dwa ou yo ak kalm. Tout sa ou di ka itilize kont ou.",
    rights: [
      { num: "01", title: "Dwa pou rete an silans", body: "Ou pa oblije reponn kesyon sou kote ou te fèt, kijan ou te antre Etazini, oswa estati imigrasyon ou." },
      { num: "02", title: "Dwa refize yon fouye", body: "Ou ka refize konsanti pou yo fouye ou oswa kay ou. Di klèman: 'Mwen pa konsanti pou fouye sa a.'" },
      { num: "03", title: "Dwa pou gen yon avoka", body: "Ou gen dwa pale ak yon avoka anvan ou reponn kesyon. Si yo arete ou, di: 'Mwen vle yon avoka.'" },
      { num: "04", title: "Pa louvri pòt la", body: "ICE pa ka antre nan kay ou san yon manda ki siyen pa yon jij. Mande pou wè manda a atravè pòt la." },
      { num: "05", title: "Dwa pou fè yon apèl", body: "Si yo detni ou, ou gen dwa fè yon apèl telefòn. Rele yon avoka oswa yon kontak ou fè konfyans imedyatman." },
      { num: "06", title: "Pa siyen anyen", body: "Pa siyen okenn dokiman san ou pa pale ak yon avoka dabò. Ou ka ap abandone dwa ou yo." },
    ],
  },
  pt: {
    label: "Conheça Seus Direitos",
    title: "Você tem direitos. Use-os.",
    subtitle: "Independentemente do seu status de imigração, você tem direitos constitucionais ao interagir com o ICE ou a aplicação da lei. Conheça-os. Use-os.",
    warnLabel: "Importante",
    warnText: "Não fuja. Não resista fisicamente. Afirme seus direitos com calma. Tudo o que você disser pode ser usado contra você.",
    rights: [
      { num: "01", title: "Direito de ficar em silêncio", body: "Você não precisa responder perguntas sobre onde nasceu, como entrou nos EUA ou seu status de imigração." },
      { num: "02", title: "Direito de recusar uma busca", body: "Você pode recusar consentir a uma busca em você ou em sua casa. Diga claramente: 'Não consinto com esta busca.'" },
      { num: "03", title: "Direito a um advogado", body: "Você tem o direito de falar com um advogado antes de responder perguntas. Se preso, diga: 'Eu quero um advogado.'" },
      { num: "04", title: "Não abra a porta", body: "O ICE não pode entrar em sua casa sem um mandado assinado por um juiz. Peça para ver o mandado pela porta." },
      { num: "05", title: "Direito de fazer uma ligação", body: "Se detido, você tem o direito de fazer uma ligação. Ligue para um advogado ou contato de confiança imediatamente." },
      { num: "06", title: "Não assine nada", body: "Não assine nenhum documento sem antes falar com um advogado. Você pode estar renunciando aos seus direitos." },
    ],
  },
  hi: {
    label: "अपने अधिकार जानें",
    title: "आपके अधिकार हैं। उनका उपयोग करें।",
    subtitle: "आपकी आव्रजन स्थिति चाहे जो भी हो, ICE या कानून प्रवर्तन के साथ बातचीत करते समय आपके संवैधानिक अधिकार हैं। उन्हें जानें। उनका उपयोग करें।",
    warnLabel: "महत्वपूर्ण",
    warnText: "भागें नहीं। शारीरिक रूप से प्रतिरोध न करें। शांतिपूर्वक अपने अधिकारों का दावा करें। आप जो कुछ भी कहते हैं वह आपके खिलाफ इस्तेमाल किया जा सकता है।",
    rights: [
      { num: "01", title: "चुप रहने का अधिकार", body: "आपको यह बताना जरूरी नहीं कि आप कहाँ पैदा हुए, अमेरिका कैसे आए या आपकी आव्रजन स्थिति क्या है।" },
      { num: "02", title: "तलाशी से इनकार करने का अधिकार", body: "आप अपनी या अपने घर की तलाशी की सहमति देने से इनकार कर सकते हैं। स्पष्ट रूप से कहें: 'मैं इस तलाशी के लिए सहमत नहीं हूँ।'" },
      { num: "03", title: "वकील का अधिकार", body: "सवालों का जवाब देने से पहले आपको वकील से बात करने का अधिकार है। गिरफ्तार होने पर कहें: 'मुझे वकील चाहिए।'" },
      { num: "04", title: "दरवाजा न खोलें", body: "ICE बिना जज के हस्ताक्षरित वारंट के आपके घर में प्रवेश नहीं कर सकता। दरवाजे से वारंट देखने की मांग करें।" },
      { num: "05", title: "फोन करने का अधिकार", body: "यदि हिरासत में लिया गया हो तो आपको फोन करने का अधिकार है। तुरंत किसी वकील या विश्वसनीय व्यक्ति को कॉल करें।" },
      { num: "06", title: "कुछ भी न हस्ताक्षर करें", body: "वकील से बात किए बिना कोई भी दस्तावेज़ पर हस्ताक्षर न करें। आप अपने अधिकार छोड़ सकते हैं।" },
    ],
  },
  ko: {
    label: "당신의 권리를 알아두세요",
    title: "당신에게는 권리가 있습니다. 사용하세요.",
    subtitle: "이민 신분에 관계없이 ICE 또는 법 집행 기관과 상호작용할 때 헌법상 권리가 있습니다. 알아두세요. 사용하세요.",
    warnLabel: "중요",
    warnText: "도망치지 마세요. 물리적으로 저항하지 마세요. 침착하게 권리를 주장하세요. 당신이 말하는 모든 것이 당신에게 불리하게 사용될 수 있습니다.",
    rights: [
      { num: "01", title: "묵비권", body: "출생지, 미국 입국 방법 또는 이민 신분에 관한 질문에 답할 필요가 없습니다." },
      { num: "02", title: "수색 거부권", body: "본인 또는 집 수색에 동의를 거부할 수 있습니다. 명확하게 말하세요: '이 수색에 동의하지 않습니다.'" },
      { num: "03", title: "변호사 권리", body: "질문에 답하기 전에 변호사와 대화할 권리가 있습니다. 체포되면 말하세요: '변호사가 필요합니다.'" },
      { num: "04", title: "문을 열지 마세요", body: "ICE는 판사가 서명한 영장 없이 집에 들어올 수 없습니다. 문을 통해 영장을 보여달라고 요청하세요." },
      { num: "05", title: "전화할 권리", body: "구금된 경우 전화할 권리가 있습니다. 즉시 변호사나 신뢰할 수 있는 연락처에 전화하세요." },
      { num: "06", title: "아무것도 서명하지 마세요", body: "변호사와 먼저 상담하지 않고 어떤 서류에도 서명하지 마세요. 권리를 포기하는 것일 수 있습니다." },
    ],
  },
  tl: {
    label: "Alamin ang Iyong mga Karapatan",
    title: "Mayroon kang mga karapatan. Gamitin ang mga ito.",
    subtitle: "Anuman ang iyong katayuan sa imigrasyon, mayroon kang mga karapatang konstitusyonal kapag nakikipag-ugnayan sa ICE o sa pagpapatupad ng batas. Alamin ang mga ito. Gamitin ang mga ito.",
    warnLabel: "Mahalaga",
    warnText: "Huwag tumakbo. Huwag lumaban nang pisikal. Mahinahong igiit ang iyong mga karapatan. Lahat ng iyong sasabihin ay maaaring gamitin laban sa iyo.",
    rights: [
      { num: "01", title: "Karapatang manatiling tahimik", body: "Hindi mo kailangang sagutin ang mga tanong tungkol sa iyong pinanganak, kung paano ka pumasok sa US, o ang iyong katayuan sa imigrasyon." },
      { num: "02", title: "Karapatang tumanggi sa paghahanap", body: "Maaari kang tumanggi na payagan ang paghahanap sa iyong sarili o sa iyong tahanan. Sabihin nang malinaw: 'Hindi ako pumapayag sa paghahanap na ito.'" },
      { num: "03", title: "Karapatang magkaroon ng abogado", body: "Mayroon kang karapatang makipag-usap sa isang abogado bago sagutin ang mga tanong. Kung ikaw ay inaresto, sabihin: 'Gusto ko ng abogado.'" },
      { num: "04", title: "Huwag buksan ang pinto", body: "Hindi makapasok ang ICE sa iyong tahanan nang walang warrant na nilagdaan ng isang hukom. Humingi na makita ang warrant sa pamamagitan ng pinto." },
      { num: "05", title: "Karapatang tumawag", body: "Kung ikaw ay dinakip, mayroon kang karapatang tumawag sa telepono. Tumawag agad sa isang abogado o mapagkakatiwalaang contact." },
      { num: "06", title: "Huwag pumirma ng anuman", body: "Huwag pumirma ng anumang dokumento nang hindi muna nakikipag-usap sa isang abogado. Maaari kang sumuko ng iyong mga karapatan." },
    ],
  },
  ru: {
    label: "Знайте свои права",
    title: "У вас есть права. Используйте их.",
    subtitle: "Независимо от вашего иммиграционного статуса, у вас есть конституционные права при взаимодействии с ICE или правоохранительными органами. Знайте их. Используйте их.",
    warnLabel: "Важно",
    warnText: "Не убегайте. Не оказывайте физического сопротивления. Спокойно отстаивайте свои права. Всё, что вы скажете, может быть использовано против вас.",
    rights: [
      { num: "01", title: "Право хранить молчание", body: "Вы не обязаны отвечать на вопросы о месте рождения, способе въезда в США или иммиграционном статусе." },
      { num: "02", title: "Право отказаться от обыска", body: "Вы можете отказать в согласии на обыск себя или вашего дома. Скажите чётко: 'Я не согласен на этот обыск.'" },
      { num: "03", title: "Право на адвоката", body: "Вы имеете право поговорить с адвокатом перед ответом на вопросы. При аресте скажите: 'Я хочу адвоката.'" },
      { num: "04", title: "Не открывайте дверь", body: "ICE не может войти в ваш дом без ордера, подписанного судьёй. Попросите показать ордер через дверь." },
      { num: "05", title: "Право позвонить", body: "Если вас задержали, вы имеете право позвонить. Немедленно свяжитесь с адвокатом или доверенным лицом." },
      { num: "06", title: "Ничего не подписывайте", body: "Не подписывайте никаких документов без предварительной консультации с адвокатом. Вы можете отказаться от своих прав." },
    ],
  },
  pl: {
    label: "Poznaj swoje prawa",
    title: "Masz prawa. Korzystaj z nich.",
    subtitle: "Niezależnie od swojego statusu imigracyjnego, masz prawa konstytucyjne podczas interakcji z ICE lub organami ścigania. Poznaj je. Korzystaj z nich.",
    warnLabel: "Ważne",
    warnText: "Nie uciekaj. Nie stawiaj fizycznego oporu. Spokojnie dochodzić swoich praw. Wszystko, co powiesz, może zostać użyte przeciwko tobie.",
    rights: [
      { num: "01", title: "Prawo do milczenia", body: "Nie musisz odpowiadać na pytania o miejsce urodzenia, sposób wjazdu do USA ani swój status imigracyjny." },
      { num: "02", title: "Prawo do odmowy przeszukania", body: "Możesz odmówić zgody na przeszukanie siebie lub swojego domu. Powiedz wyraźnie: 'Nie zgadzam się na to przeszukanie.'" },
      { num: "03", title: "Prawo do adwokata", body: "Masz prawo porozmawiać z adwokatem przed odpowiedzią na pytania. Jeśli zostaniesz zatrzymany, powiedz: 'Chcę adwokata.'" },
      { num: "04", title: "Nie otwieraj drzwi", body: "ICE nie może wejść do twojego domu bez nakazu podpisanego przez sędziego. Poproś o pokazanie nakazu przez drzwi." },
      { num: "05", title: "Prawo do telefonu", body: "Jeśli zostaniesz zatrzymany, masz prawo do jednego telefonu. Zadzwoń do adwokata lub zaufanej osoby natychmiast." },
      { num: "06", title: "Nic nie podpisuj", body: "Nie podpisuj żadnych dokumentów bez wcześniejszej rozmowy z adwokatem. Możesz zrzekać się swoich praw." },
    ],
  },
}

export const languages: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "fr", label: "Français" },
  { code: "ht", label: "Kreyòl" },
  { code: "pt", label: "Português" },
  { code: "hi", label: "हिन्दी" },
  { code: "ko", label: "한국어" },
  { code: "tl", label: "Tagalog" },
  { code: "ru", label: "Русский" },
  { code: "pl", label: "Polski" },
]
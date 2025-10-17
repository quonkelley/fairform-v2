import type { SupportedLanguage } from '@/lib/ai/languageDetection';

export interface Translations {
  // Common UI elements
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    close: string;
    save: string;
    edit: string;
    delete: string;
    back: string;
    next: string;
    submit: string;
    search: string;
    filter: string;
    sort: string;
    refresh: string;
  };
  
  // AI Copilot specific
  aiCopilot: {
    title: string;
    welcome: string;
    welcomeMessage: string;
    typing: string;
    sendMessage: string;
    placeholder: string;
    uploadDocument: string;
    processingDocument: string;
    connected: string;
    connecting: string;
    disconnected: string;
    language: string;
    selectLanguage: string;
  };
  
  // Case related
  case: {
    createCase: string;
    caseNumber: string;
    caseType: string;
    jurisdiction: string;
    hearingDate: string;
    courtName: string;
    status: string;
    nextSteps: string;
    documents: string;
    timeline: string;
  };
  
  // Forms
  forms: {
    appearance: string;
    response: string;
    motion: string;
    evidence: string;
    required: string;
    optional: string;
    fillOut: string;
    download: string;
    preview: string;
  };
  
  // Navigation
  navigation: {
    dashboard: string;
    cases: string;
    forms: string;
    help: string;
    settings: string;
    profile: string;
    logout: string;
  };
  
  // Auth
  auth: {
    login: string;
    signup: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    resetPassword: string;
    createAccount: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
  };
  
  // Errors
  errors: {
    generic: string;
    network: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    serverError: string;
    validation: string;
    required: string;
    invalidEmail: string;
    passwordTooShort: string;
    passwordsDoNotMatch: string;
  };
}

const translations: Record<SupportedLanguage, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
    },
    aiCopilot: {
      title: 'AI Copilot',
      welcome: 'Welcome to AI Copilot',
      welcomeMessage: 'Hi! I\'m FairForm. Tell me what happened or upload a photo of your court notice. I\'ll create your case and show next steps in under 2 minutes.',
      typing: 'AI is typing...',
      sendMessage: 'Send message',
      placeholder: 'Type your message... (Enter to send, Shift+Enter for new line)',
      uploadDocument: 'Upload document',
      processingDocument: 'Processing document...',
      connected: 'Connected',
      connecting: 'Connecting...',
      disconnected: 'Disconnected',
      language: 'Language',
      selectLanguage: 'Select Language',
    },
    case: {
      createCase: 'Create Case',
      caseNumber: 'Case Number',
      caseType: 'Case Type',
      jurisdiction: 'Jurisdiction',
      hearingDate: 'Hearing Date',
      courtName: 'Court Name',
      status: 'Status',
      nextSteps: 'Next Steps',
      documents: 'Documents',
      timeline: 'Timeline',
    },
    forms: {
      appearance: 'Appearance',
      response: 'Response',
      motion: 'Motion',
      evidence: 'Evidence',
      required: 'Required',
      optional: 'Optional',
      fillOut: 'Fill Out',
      download: 'Download',
      preview: 'Preview',
    },
    navigation: {
      dashboard: 'Dashboard',
      cases: 'Cases',
      forms: 'Forms',
      help: 'Help',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
    },
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: 'Don\'t have an account?',
    },
    errors: {
      generic: 'Something went wrong. Please try again.',
      network: 'Network error. Please check your connection.',
      unauthorized: 'You are not authorized to perform this action.',
      forbidden: 'Access denied.',
      notFound: 'The requested resource was not found.',
      serverError: 'Server error. Please try again later.',
      validation: 'Please check your input and try again.',
      required: 'This field is required.',
      invalidEmail: 'Please enter a valid email address.',
      passwordTooShort: 'Password must be at least 8 characters long.',
      passwordsDoNotMatch: 'Passwords do not match.',
    },
  },
  
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      retry: 'Reintentar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      close: 'Cerrar',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      back: 'Atrás',
      next: 'Siguiente',
      submit: 'Enviar',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      refresh: 'Actualizar',
    },
    aiCopilot: {
      title: 'Asistente IA',
      welcome: 'Bienvenido al Asistente IA',
      welcomeMessage: '¡Hola! Soy FairForm. Cuéntame qué pasó o sube una foto de tu aviso judicial. Crearé tu caso y te mostraré los próximos pasos en menos de 2 minutos.',
      typing: 'La IA está escribiendo...',
      sendMessage: 'Enviar mensaje',
      placeholder: 'Escribe tu mensaje... (Enter para enviar, Shift+Enter para nueva línea)',
      uploadDocument: 'Subir documento',
      processingDocument: 'Procesando documento...',
      connected: 'Conectado',
      connecting: 'Conectando...',
      disconnected: 'Desconectado',
      language: 'Idioma',
      selectLanguage: 'Seleccionar Idioma',
    },
    case: {
      createCase: 'Crear Caso',
      caseNumber: 'Número de Caso',
      caseType: 'Tipo de Caso',
      jurisdiction: 'Jurisdicción',
      hearingDate: 'Fecha de Audiencia',
      courtName: 'Nombre del Tribunal',
      status: 'Estado',
      nextSteps: 'Próximos Pasos',
      documents: 'Documentos',
      timeline: 'Cronología',
    },
    forms: {
      appearance: 'Comparecencia',
      response: 'Respuesta',
      motion: 'Moción',
      evidence: 'Pruebas',
      required: 'Requerido',
      optional: 'Opcional',
      fillOut: 'Llenar',
      download: 'Descargar',
      preview: 'Vista Previa',
    },
    navigation: {
      dashboard: 'Panel',
      cases: 'Casos',
      forms: 'Formularios',
      help: 'Ayuda',
      settings: 'Configuración',
      profile: 'Perfil',
      logout: 'Cerrar Sesión',
    },
    auth: {
      login: 'Iniciar Sesión',
      signup: 'Registrarse',
      logout: 'Cerrar Sesión',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      resetPassword: 'Restablecer Contraseña',
      createAccount: 'Crear Cuenta',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      dontHaveAccount: '¿No tienes una cuenta?',
    },
    errors: {
      generic: 'Algo salió mal. Por favor, inténtalo de nuevo.',
      network: 'Error de red. Por favor, verifica tu conexión.',
      unauthorized: 'No estás autorizado para realizar esta acción.',
      forbidden: 'Acceso denegado.',
      notFound: 'El recurso solicitado no fue encontrado.',
      serverError: 'Error del servidor. Por favor, inténtalo más tarde.',
      validation: 'Por favor, verifica tu entrada e inténtalo de nuevo.',
      required: 'Este campo es obligatorio.',
      invalidEmail: 'Por favor, ingresa una dirección de correo válida.',
      passwordTooShort: 'La contraseña debe tener al menos 8 caracteres.',
      passwordsDoNotMatch: 'Las contraseñas no coinciden.',
    },
  },
  
  zh: {
    common: {
      loading: '加载中...',
      error: '错误',
      retry: '重试',
      cancel: '取消',
      confirm: '确认',
      close: '关闭',
      save: '保存',
      edit: '编辑',
      delete: '删除',
      back: '返回',
      next: '下一步',
      submit: '提交',
      search: '搜索',
      filter: '筛选',
      sort: '排序',
      refresh: '刷新',
    },
    aiCopilot: {
      title: 'AI 助手',
      welcome: '欢迎使用 AI 助手',
      welcomeMessage: '您好！我是 FairForm。告诉我发生了什么，或者上传您的法庭通知照片。我将在 2 分钟内创建您的案件并显示后续步骤。',
      typing: 'AI 正在输入...',
      sendMessage: '发送消息',
      placeholder: '输入您的消息...（回车发送，Shift+回车换行）',
      uploadDocument: '上传文档',
      processingDocument: '处理文档中...',
      connected: '已连接',
      connecting: '连接中...',
      disconnected: '已断开',
      language: '语言',
      selectLanguage: '选择语言',
    },
    case: {
      createCase: '创建案件',
      caseNumber: '案件编号',
      caseType: '案件类型',
      jurisdiction: '管辖范围',
      hearingDate: '听证日期',
      courtName: '法院名称',
      status: '状态',
      nextSteps: '下一步',
      documents: '文档',
      timeline: '时间线',
    },
    forms: {
      appearance: '出庭',
      response: '回应',
      motion: '动议',
      evidence: '证据',
      required: '必填',
      optional: '可选',
      fillOut: '填写',
      download: '下载',
      preview: '预览',
    },
    navigation: {
      dashboard: '仪表板',
      cases: '案件',
      forms: '表格',
      help: '帮助',
      settings: '设置',
      profile: '个人资料',
      logout: '退出登录',
    },
    auth: {
      login: '登录',
      signup: '注册',
      logout: '退出登录',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      forgotPassword: '忘记密码？',
      resetPassword: '重置密码',
      createAccount: '创建账户',
      alreadyHaveAccount: '已有账户？',
      dontHaveAccount: '没有账户？',
    },
    errors: {
      generic: '出了点问题。请重试。',
      network: '网络错误。请检查您的连接。',
      unauthorized: '您无权执行此操作。',
      forbidden: '访问被拒绝。',
      notFound: '未找到请求的资源。',
      serverError: '服务器错误。请稍后重试。',
      validation: '请检查您的输入并重试。',
      required: '此字段为必填项。',
      invalidEmail: '请输入有效的邮箱地址。',
      passwordTooShort: '密码至少需要 8 个字符。',
      passwordsDoNotMatch: '密码不匹配。',
    },
  },
  
  vi: {
    common: {
      loading: 'Đang tải...',
      error: 'Lỗi',
      retry: 'Thử lại',
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      close: 'Đóng',
      save: 'Lưu',
      edit: 'Chỉnh sửa',
      delete: 'Xóa',
      back: 'Quay lại',
      next: 'Tiếp theo',
      submit: 'Gửi',
      search: 'Tìm kiếm',
      filter: 'Lọc',
      sort: 'Sắp xếp',
      refresh: 'Làm mới',
    },
    aiCopilot: {
      title: 'Trợ lý AI',
      welcome: 'Chào mừng đến với Trợ lý AI',
      welcomeMessage: 'Xin chào! Tôi là FairForm. Hãy cho tôi biết chuyện gì đã xảy ra hoặc tải lên ảnh thông báo tòa án của bạn. Tôi sẽ tạo vụ án của bạn và hiển thị các bước tiếp theo trong vòng 2 phút.',
      typing: 'AI đang gõ...',
      sendMessage: 'Gửi tin nhắn',
      placeholder: 'Nhập tin nhắn của bạn... (Enter để gửi, Shift+Enter để xuống dòng)',
      uploadDocument: 'Tải lên tài liệu',
      processingDocument: 'Đang xử lý tài liệu...',
      connected: 'Đã kết nối',
      connecting: 'Đang kết nối...',
      disconnected: 'Đã ngắt kết nối',
      language: 'Ngôn ngữ',
      selectLanguage: 'Chọn Ngôn ngữ',
    },
    case: {
      createCase: 'Tạo Vụ án',
      caseNumber: 'Số Vụ án',
      caseType: 'Loại Vụ án',
      jurisdiction: 'Thẩm quyền',
      hearingDate: 'Ngày Phiên tòa',
      courtName: 'Tên Tòa án',
      status: 'Trạng thái',
      nextSteps: 'Bước Tiếp theo',
      documents: 'Tài liệu',
      timeline: 'Timeline',
    },
    forms: {
      appearance: 'Xuất hiện',
      response: 'Phản hồi',
      motion: 'Động thái',
      evidence: 'Bằng chứng',
      required: 'Bắt buộc',
      optional: 'Tùy chọn',
      fillOut: 'Điền',
      download: 'Tải xuống',
      preview: 'Xem trước',
    },
    navigation: {
      dashboard: 'Bảng điều khiển',
      cases: 'Vụ án',
      forms: 'Biểu mẫu',
      help: 'Trợ giúp',
      settings: 'Cài đặt',
      profile: 'Hồ sơ',
      logout: 'Đăng xuất',
    },
    auth: {
      login: 'Đăng nhập',
      signup: 'Đăng ký',
      logout: 'Đăng xuất',
      email: 'Email',
      password: 'Mật khẩu',
      confirmPassword: 'Xác nhận Mật khẩu',
      forgotPassword: 'Quên mật khẩu?',
      resetPassword: 'Đặt lại Mật khẩu',
      createAccount: 'Tạo Tài khoản',
      alreadyHaveAccount: 'Đã có tài khoản?',
      dontHaveAccount: 'Chưa có tài khoản?',
    },
    errors: {
      generic: 'Đã xảy ra lỗi. Vui lòng thử lại.',
      network: 'Lỗi mạng. Vui lòng kiểm tra kết nối của bạn.',
      unauthorized: 'Bạn không có quyền thực hiện hành động này.',
      forbidden: 'Truy cập bị từ chối.',
      notFound: 'Không tìm thấy tài nguyên được yêu cầu.',
      serverError: 'Lỗi máy chủ. Vui lòng thử lại sau.',
      validation: 'Vui lòng kiểm tra đầu vào của bạn và thử lại.',
      required: 'Trường này là bắt buộc.',
      invalidEmail: 'Vui lòng nhập địa chỉ email hợp lệ.',
      passwordTooShort: 'Mật khẩu phải có ít nhất 8 ký tự.',
      passwordsDoNotMatch: 'Mật khẩu không khớp.',
    },
  },
  
  ar: {
    common: {
      loading: 'جاري التحميل...',
      error: 'خطأ',
      retry: 'إعادة المحاولة',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      close: 'إغلاق',
      save: 'حفظ',
      edit: 'تعديل',
      delete: 'حذف',
      back: 'رجوع',
      next: 'التالي',
      submit: 'إرسال',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      refresh: 'تحديث',
    },
    aiCopilot: {
      title: 'المساعد الذكي',
      welcome: 'مرحباً بك في المساعد الذكي',
      welcomeMessage: 'مرحباً! أنا FairForm. أخبرني بما حدث أو ارفع صورة إشعار المحكمة. سأقوم بإنشاء قضيتك وإظهار الخطوات التالية في أقل من دقيقتين.',
      typing: 'المساعد الذكي يكتب...',
      sendMessage: 'إرسال رسالة',
      placeholder: 'اكتب رسالتك... (Enter للإرسال، Shift+Enter لسطر جديد)',
      uploadDocument: 'رفع مستند',
      processingDocument: 'جاري معالجة المستند...',
      connected: 'متصل',
      connecting: 'جاري الاتصال...',
      disconnected: 'غير متصل',
      language: 'اللغة',
      selectLanguage: 'اختر اللغة',
    },
    case: {
      createCase: 'إنشاء قضية',
      caseNumber: 'رقم القضية',
      caseType: 'نوع القضية',
      jurisdiction: 'الاختصاص',
      hearingDate: 'تاريخ الجلسة',
      courtName: 'اسم المحكمة',
      status: 'الحالة',
      nextSteps: 'الخطوات التالية',
      documents: 'المستندات',
      timeline: 'الجدول الزمني',
    },
    forms: {
      appearance: 'الحضور',
      response: 'الرد',
      motion: 'الطلب',
      evidence: 'الأدلة',
      required: 'مطلوب',
      optional: 'اختياري',
      fillOut: 'ملء',
      download: 'تحميل',
      preview: 'معاينة',
    },
    navigation: {
      dashboard: 'لوحة التحكم',
      cases: 'القضايا',
      forms: 'النماذج',
      help: 'المساعدة',
      settings: 'الإعدادات',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج',
    },
    auth: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      resetPassword: 'إعادة تعيين كلمة المرور',
      createAccount: 'إنشاء حساب',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      dontHaveAccount: 'ليس لديك حساب؟',
    },
    errors: {
      generic: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
      network: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
      unauthorized: 'غير مخول لك لتنفيذ هذا الإجراء.',
      forbidden: 'تم رفض الوصول.',
      notFound: 'لم يتم العثور على المورد المطلوب.',
      serverError: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
      validation: 'يرجى التحقق من إدخالك والمحاولة مرة أخرى.',
      required: 'هذا الحقل مطلوب.',
      invalidEmail: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
      passwordTooShort: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.',
      passwordsDoNotMatch: 'كلمات المرور غير متطابقة.',
    },
  },
};

export function getTranslations(language: SupportedLanguage): Translations {
  return translations[language] || translations.en;
}

export function t(key: string, language: SupportedLanguage): string {
  const keys = key.split('.');
  let value: any = getTranslations(language);
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English if translation not found
      value = getTranslations('en');
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }
  
  return value || key;
}

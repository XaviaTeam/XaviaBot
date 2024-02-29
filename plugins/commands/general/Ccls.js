// Nha Uyen dethw s1
const config = {

  name: "infofb",

  description: "info account Facebook",

  usage: ["ifb"],

  credits: "Xavia Team - Tphat",

  cooldown: 5,

};

const langData = {

  vi_VN: {

    result:

      "Thông tin của ID: {uid}\nTên người dùng: {name}\nNgày tạo tài khoản: {created_time}\nNgày sinh: {birthday}\nTình trạng mối quan hệ: {relationship_status}\nSố lượt theo dõi: {follower}\nTick xanh: {tichxanh}\nQuốc gia: {locale}, {location}",

    missingInput: "Vui lòng nhập ID tài khoản Facebook của bạn",

    notFound: "Không tìm thấy dữ liệu.",

    error: "Đã xảy ra lỗi. Xin lỗi vì sự bất tiện này.",

  },

  ar_SY: {

    result:

      "معلومات الهوية: {uid}\nاسم المستخدم: {name}\nتاريخ إنشاء الحساب: {created_time}\nتاريخ الميلاد: {birthday}\nحالة العلاقة: {relationship_status}\nعدد المتابعين: {follower}\nعلامة التحقق الزرقاء: {tichxanh}\nالدولة: {locale}, {location}",

    missingInput: "يرجى إدخال معرف حساب Facebook الخاص بك",

    notFound: "لم يتم العثور على بيانات.",

    error: "حدث خطأ. نأسف على الإزعاج.",

  },
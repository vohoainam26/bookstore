import { siteConfig } from "../site-config";

export const shoppingGuideContent = [
  {
    title: "1. Tìm kiếm sản phẩm",
    content: "Sử dụng thanh tìm kiếm hoặc duyệt qua các danh mục (Văn phòng phẩm, Sách mới, v.v.) để tìm sản phẩm bạn mong muốn."
  },
  {
    title: "2. Xem chi tiết và thêm vào giỏ",
    content: "Nhấp vào sản phẩm để xem thông tin chi tiết. Chọn số lượng và nhấn nút 'Thêm vào giỏ hàng'."
  },
  {
    title: "3. Kiểm tra giỏ hàng",
    content: "Nhấn vào biểu tượng Giỏ hàng ở góc phải màn hình để xem lại các sản phẩm đã chọn, điều chỉnh số lượng hoặc xóa sản phẩm nếu cần."
  },
  {
    title: "4. Đăng nhập hoặc đăng ký",
    content: "Để tiến hành thanh toán, bạn cần đăng nhập tài khoản. Nếu chưa có, bạn có thể dễ dàng đăng ký bằng email."
  },
  {
    title: "5. Chọn địa chỉ và vận chuyển",
    content: "Nhập thông tin giao hàng chi tiết. Hệ thống sẽ tính phí vận chuyển dựa trên khu vực của bạn."
  },
  {
    title: "6. Thanh toán",
    content: "Lựa chọn phương thức thanh toán phù hợp (Tiền mặt, Chuyển khoản, v.v.) và áp dụng mã giảm giá (nếu có)."
  },
  {
    title: "7. Xác nhận đơn hàng",
    content: "Kiểm tra lại toàn bộ thông tin và nhấn 'Đặt hàng'. Bạn sẽ nhận được email xác nhận ngay sau đó."
  },
  {
    title: "8. Theo dõi đơn hàng",
    content: "Bạn có thể vào mục 'Đơn hàng của tôi' hoặc trang 'Theo dõi đơn hàng' để xem trạng thái vận chuyển của đơn hàng."
  }
];

export const returnsPolicyContent = {
  lastUpdated: "2025-01-01",
  sections: [
    {
      title: "1. Điều kiện đổi/trả hàng",
      content: "Sản phẩm còn nguyên vẹn, chưa qua sử dụng, còn giữ nguyên tem mác và hóa đơn mua hàng. Yêu cầu đổi trả phải được thực hiện trong vòng 7 ngày kể từ ngày nhận hàng."
    },
    {
      title: "2. Các trường hợp không hỗ trợ",
      content: "Sản phẩm nằm trong chương trình Flash Sale, xả kho, hoặc sản phẩm đã bị hư hỏng do lỗi từ phía khách hàng (trầy xước, vào nước...)."
    },
    {
      title: "3. Tình trạng sản phẩm lỗi",
      content: "Nếu sản phẩm bị lỗi từ nhà sản xuất hoặc giao sai sản phẩm, chúng tôi sẽ chịu toàn bộ chi phí vận chuyển để đổi mới hoặc hoàn tiền cho bạn."
    },
    {
      title: "4. Quy trình xử lý",
      content: `Vui lòng liên hệ bộ phận CSKH qua email ${siteConfig.contact.email} hoặc hotline ${siteConfig.contact.phone}. Thời gian xử lý dự kiến từ 3-5 ngày làm việc sau khi chúng tôi nhận được hàng hoàn trả.`
    },
    {
      title: "5. Phương thức hoàn tiền",
      content: "Tiền sẽ được hoàn về tài khoản ngân hàng hoặc phương thức thanh toán ban đầu của quý khách trong vòng 7-14 ngày làm việc."
    }
  ]
};

export const faqContent = [
  {
    category: "Tài khoản & Mua hàng",
    questions: [
      { q: "Có thể mua hàng khi chưa đăng nhập không?", a: "Hiện tại, để đảm bảo quyền lợi và dễ dàng theo dõi đơn hàng, bạn cần đăng nhập tài khoản để đặt hàng." },
      { q: "Làm thế nào để thay đổi hoặc hủy đơn?", a: "Bạn chỉ có thể hủy đơn khi đơn hàng đang ở trạng thái 'Chờ xác nhận'. Hãy vào phần Lịch sử đơn hàng để thao tác." },
    ]
  },
  {
    category: "Thanh toán & Vận chuyển",
    questions: [
      { q: "Phí vận chuyển được tính thế nào?", a: "Phí vận chuyển được tính tự động tại bước thanh toán dựa trên địa chỉ giao hàng và trọng lượng của đơn hàng." },
      { q: "Khi nào đơn được xác nhận thanh toán?", a: "Nếu thanh toán chuyển khoản, đơn sẽ được xác nhận ngay sau khi hệ thống nhận được tiền (thường trong vòng 5-15 phút)." },
    ]
  },
  {
    category: "Mã giảm giá",
    questions: [
      { q: "Có thể dùng nhiều mã cho một đơn không?", a: "Rất tiếc, mỗi đơn hàng chỉ được áp dụng 01 mã giảm giá duy nhất." },
    ]
  }
];

export const aboutContent = {
  mission: `Tại ${siteConfig.name}, chúng tôi tin rằng mỗi cuốn sách đều chứa đựng một thế giới cần được khám phá. Sứ mệnh của chúng tôi là tuyển chọn và mang đến cho độc giả những ấn phẩm chất lượng cao, truyền cảm hứng đọc và viết cho mọi lứa tuổi.`,
  vision: "Trở thành hệ thống cửa hàng sách và văn phòng phẩm cao cấp hàng đầu, nơi hội tụ những giá trị tri thức và nghệ thuật đích thực.",
  values: [
    { title: "Chất lượng hàng đầu", desc: "Mỗi sản phẩm đều được kiểm định kỹ lưỡng trước khi lên kệ." },
    { title: "Trải nghiệm vượt trội", desc: "Không gian mua sắm tinh tế, dịch vụ chăm sóc khách hàng tận tâm." },
    { title: "Đồng hành cùng tri thức", desc: "Góp phần lan tỏa văn hóa đọc đến cộng đồng." }
  ]
};

export const privacyPolicyContent = {
  lastUpdated: "2025-01-01",
  sections: [
    {
      title: "1. Mục đích thu thập dữ liệu",
      content: `Dữ liệu cá nhân (họ tên, email, số điện thoại, địa chỉ) được thu thập chủ yếu để xử lý đơn hàng, vận chuyển và hỗ trợ khách hàng của ${siteConfig.name}.`
    },
    {
      title: "2. Lưu trữ và bảo mật",
      content: "Chúng tôi áp dụng các tiêu chuẩn bảo mật cơ sở dữ liệu hiện đại. Hệ thống không lưu trữ trực tiếp thông tin thẻ tín dụng của bạn. Mật khẩu được mã hóa an toàn qua dịch vụ xác thực chuẩn quốc tế."
    },
    {
      title: "3. Chia sẻ dữ liệu",
      content: "Chúng tôi chỉ chia sẻ thông tin giao hàng của bạn với các đối tác vận chuyển để hoàn tất đơn hàng. Chúng tôi cam kết không bán dữ liệu cho bên thứ ba vì mục đích thương mại."
    },
    {
      title: "4. Cookie",
      content: "Chúng tôi sử dụng cookie để ghi nhớ phiên đăng nhập và các tùy chọn mua sắm của bạn, giúp cải thiện trải nghiệm trên website."
    }
  ]
};

export const termsContent = {
  lastUpdated: "2025-01-01",
  sections: [
    {
      title: "1. Tài khoản người dùng",
      content: "Bạn có trách nhiệm bảo mật tài khoản của mình. Mọi giao dịch phát sinh từ tài khoản của bạn sẽ do bạn chịu trách nhiệm."
    },
    {
      title: "2. Giá bán và đơn hàng",
      content: "Giá bán có thể thay đổi mà không cần báo trước. Chúng tôi có quyền hủy các đơn hàng phát sinh do lỗi hệ thống hiển thị sai giá (nếu có) và sẽ thông báo/hoàn tiền lại cho bạn."
    },
    {
      title: "3. Sở hữu trí tuệ",
      content: "Tất cả nội dung, hình ảnh, bài viết trên website này thuộc bản quyền của chúng tôi. Không được phép sao chép mà không có sự đồng ý."
    }
  ]
};

export const shippingPolicyContent = {
  lastUpdated: "2025-01-01",
  sections: [
    {
      title: "1. Phương thức vận chuyển",
      content: "Chúng tôi sử dụng các dịch vụ giao hàng uy tín trong nước để đảm bảo kiện hàng được đến tay bạn an toàn nhất."
    },
    {
      title: "2. Chi phí và thời gian",
      content: "Phí vận chuyển được tính tại bước thanh toán dựa trên địa chỉ, phương thức giao hàng và chương trình ưu đãi áp dụng. Thời gian giao hàng dự kiến thường từ 2-5 ngày tùy theo khu vực."
    },
    {
      title: "3. Theo dõi đơn hàng",
      content: "Sau khi đơn hàng được gửi đi, mã vận đơn sẽ được cập nhật trong hệ thống. Bạn có thể theo dõi tình trạng đơn hàng tại trang 'Theo dõi đơn hàng'."
    }
  ]
};

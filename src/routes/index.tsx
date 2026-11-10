import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Bé Vui Học - Học Online Toán, Tiếng Anh Lớp 1 Đến Lớp 5' },
      {
        name: 'description',
        content:
          'Nền tảng học online thông minh dành cho trẻ từ lớp 1 đến lớp 5. Cung cấp tài liệu, bài tập tương tác môn Toán và Tiếng Anh giúp bé vừa học vừa vui.',
      },
      { property: 'og:title', content: 'Bé Vui Học - Học Online Toán, Tiếng Anh Lớp 1-5' },
      {
        property: 'og:description',
        content:
          'Nền tảng học online thông minh cho trẻ tiểu học. Tài liệu và bài tập tương tác Toán, Tiếng Anh.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [{ rel: 'canonical', href: 'https://bevuihoc.lovable.app/' }],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <main>
      <h1>Bé Vui Học - Tài Liệu Và Chương Trình Học Online Cho Trẻ</h1>
      <p>
        Bé Vui Học là nền tảng học online dành cho trẻ tiểu học từ lớp 1 đến lớp 5.
        Bé học Toán và Tiếng Anh qua bài tập tương tác và trò chơi 3D, phụ huynh
        theo dõi tiến độ mỗi ngày. Miễn phí, không cần cài app.
      </p>

      <section>
        <h2>Chương Trình Toán Tiểu Học</h2>
        <p>
          Bài tập tương tác theo từng lớp, bám sát chương trình GDPT mới. Bé làm
          quen số đếm, phép tính, hình học, giải toán có lời văn.
        </p>
        <h3>Toán Lớp 1</h3>
        <p>Số đếm 1-100, cộng trừ trong phạm vi 10 và 20, hình học cơ bản.</p>
        <h3>Toán Lớp 2</h3>
        <p>Cộng trừ có nhớ, bảng nhân chia 2-5, đo lường, bài toán có lời văn.</p>
        <p><a href="/toan-lop-2">Học toán lớp 2 ngay →</a></p>
        <h3>Toán Lớp 3</h3>
        <p>Bảng nhân chia 2-9, phép chia có dư, chu vi diện tích, toán có lời văn.</p>
        <h3>Toán Lớp 4-5</h3>
        <p>Phân số, số thập phân, tỉ số phần trăm, giải toán nâng cao.</p>
        <p><a href="/toan-lop-1">Học toán lớp 1 ngay →</a></p>
      </section>

      <section>
        <h2>Học Tiếng Anh Tương Tác</h2>
        <p>
          Bé học từ vựng, luyện nghe và phát âm qua trò chơi. Bài học chia theo
          chủ đề gần gũi: gia đình, trường học, động vật, màu sắc.
        </p>
        <h3>Từ Vựng Theo Chủ Đề</h3>
        <p>Mỗi chủ đề 10-15 từ, kèm hình ảnh và phát âm chuẩn.</p>
        <h3>Luyện Nghe Phát Âm</h3>
        <p>Nghe từ chọn hình, nghe câu chọn nghĩa — tăng dần độ khó.</p>
        <h3>Mẫu Câu Giao Tiếp</h3>
        <p>Chào hỏi, giới thiệu bản thân, hỏi đồ vật — bé bắt chước tự nhiên.</p>
        <p><a href="/tieng-anh-lop-1">Học tiếng Anh lớp 1 →</a></p>
        <p><a href="/tieng-anh-lop-2">Học tiếng Anh lớp 2 →</a></p>
      </section>

      <section>
        <h2>Tài Liệu Lớp 1 Đến Lớp 5</h2>
        <p>
          Tổng hợp đề ôn tập, bài tập và hướng dẫn phụ huynh dạy con tại nhà. Tải
          về miễn phí, dùng được cả trên điện thoại.
        </p>
        <h3>Đề Ôn Tập Theo Lớp</h3>
        <p>Đề giữa kỳ, cuối kỳ môn Toán và Tiếng Anh cho cả 5 lớp.</p>
        <h3>Hướng Dẫn Phụ Huynh</h3>
        <p>Cách dạy con học toán, tiếng Anh tại nhà mà không gây áp lực.</p>
        <p><a href="/tai-lieu-toan-lop-3">Tài liệu toán lớp 3 cho phụ huynh →</a></p>
      </section>

      <section>
        <h2>Trường Học 3D - Học Mà Chơi</h2>
        <p>
          Điểm khác biệt của Bé Vui Học: bé được vào khuôn viên trường 3D, bước vào
          từng phòng học, tương tác với đồ vật để học bài. Ánh sáng ấm, không gian
          thân thiện, bé không còn cảm giác "phải học".
        </p>
        <h3>Phòng Học Tương Tác</h3>
        <p>Mỗi phòng là một môn học, bé bước vào cửa để bắt đầu bài tập.</p>
        <h3>Sân Trường Có Đèn Lồng</h3>
        <p>Không gian buổi tối lung linh, bé tham quan và khám phá.</p>
      </section>

      <section>
        <h2>Câu Hỏi Thường Gặp</h2>
        <h3>Bé Vui Học có miễn phí không?</h3>
        <p>Các bài học cơ bản miễn phí hoàn toàn. Không cần thẻ tín dụng.</p>
        <h3>Bé cần thiết bị gì?</h3>
        <p>Máy tính, tablet hoặc điện thoại có kết nối internet. Không cần cài app.</p>
        <h3>Phụ huynh có theo dõi được không?</h3>
        <p>Có. Phụ huynh xem tiến độ học của bé trong trang quản lý.</p>
        <h3>Phù hợp với bé mấy tuổi?</h3>
        <p>Trẻ từ 6 đến 11 tuổi, tương ứng lớp 1 đến lớp 5.</p>
      </section>

      <nav aria-label="Các trang học tập">
        <a href="/toan-lop-1">Toán lớp 1</a>
        {' · '}
        <a href="/toan-lop-2">Toán lớp 2</a>
        {' · '}
        <a href="/tieng-anh-lop-1">Tiếng Anh lớp 1</a>
        {' · '}
        <a href="/tieng-anh-lop-2">Tiếng Anh lớp 2</a>
        {' · '}
        <a href="/tai-lieu-toan-lop-3">Tài liệu toán lớp 3</a>
      </nav>
    </main>
  )
}

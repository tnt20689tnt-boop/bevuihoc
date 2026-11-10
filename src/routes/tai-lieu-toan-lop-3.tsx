import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tai-lieu-toan-lop-3')({
  head: () => ({
    meta: [
      { title: 'Tài Liệu Toán Lớp 3 Cho Phụ Huynh Dạy Con Tại Nhà | Bé Vui Học' },
      {
        name: 'description',
        content:
          'Tổng hợp tài liệu toán lớp 3: bảng nhân chia, bài tập có lời văn, đề ôn tập. Hướng dẫn phụ huynh dạy con tại nhà, tải về miễn phí.',
      },
      { property: 'og:title', content: 'Tài Liệu Toán Lớp 3 Cho Phụ Huynh Dạy Con Tại Nhà' },
      {
        property: 'og:description',
        content: 'Bảng nhân chia, bài tập, đề ôn tập toán lớp 3. Hướng dẫn phụ huynh dạy con.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://bevuihoc.lovable.app/tai-lieu-toan-lop-3' }],
  }),
  component: TaiLieuToanLop3,
})

function TaiLieuToanLop3() {
  return (
    <main>
      <h1>Tài Liệu Toán Lớp 3 Cho Phụ Huynh Dạy Con Tại Nhà</h1>
      <p>
        Lớp 3 là năm bé học bảng nhân chia, làm quen phân số và giải toán có lời văn.
        Nhiều phụ huynh muốn dạy con tại nhà nhưng không biết bắt đầu từ đâu. Trang
        này tổng hợp tài liệu và hướng dẫn cụ thể.
      </p>

      <h2>Kiến Thức Trọng Tâm Toán Lớp 3</h2>
      <h3>1. Bảng Nhân Chia 2 Đến 9</h3>
      <p>Bé cần thuộc lòng trước khi học các dạng toán khác. Mẹo: học qua bài hát, trò chơi.</p>
      <h3>2. Phép Chia Có Dư</h3>
      <p>Đây là dạng bé hay nhầm nhất. Cần luyện nhiều ví dụ cụ thể.</p>
      <h3>3. Toán Có Lời Văn</h3>
      <p>Bé đọc đề, tóm tắt, chọn phép tính, trình bày bài giải.</p>
      <h3>4. Hình Học Và Đo Lường</h3>
      <p>Chu vi, diện tích hình chữ nhật, hình vuông; đơn vị đo độ dài, khối lượng.</p>

      <h2>Cách Phụ Huynh Dạy Con Học Toán Lớp 3</h2>
      <h3>Bước 1: Nắm Chắc Bảng Nhân Chia</h3>
      <p>Dành 10 phút mỗi ngày, học qua trò chơi thay vì đọc thuộc lòng.</p>
      <h3>Bước 2: Luyện Từng Dạng Bài</h3>
      <p>Mỗi tuần tập trung 1 dạng, làm 5-10 bài, không làm quá nhiều gây chán.</p>
      <h3>Bước 3: Học Qua Thực Tế</h3>
      <p>Đi chợ cùng mẹ, tính tiền; đo chiều dài bàn học — bé nhớ lâu hơn.</p>
      <h3>Bước 4: Dùng Công Cụ Hỗ Trợ</h3>
      <p>Bé Vui Học có bài tập tương tác toán lớp 3, phụ huynh xem tiến độ.</p>

      <h2>Tài Liệu Tải Về</h2>
      <p>Các tệp PDF sẽ được cập nhật tại đây sau khi hoàn thiện để phụ huynh tải xuống.</p>

      <h2>Câu Hỏi Thường Gặp</h2>
      <h3>Bé lớp 3 chưa thuộc bảng nhân có sao không?</h3>
      <p>Không sao, nhưng cần luyện sớm vì lớp 4 sẽ dùng nhiều. Bắt đầu từ bảng 2, 5, 10 dễ nhất.</p>
      <h3>Nên cho bé học bao lâu mỗi ngày?</h3>
      <p>15-20 phút/ngày là đủ. Quan trọng là đều đặn, không học dồn.</p>

      <div>
        <a href="/">← Về trang chủ Bé Vui Học</a>
        {' · '}
        <a href="/toan-lop-1">Học toán lớp 1 →</a>
      </div>
    </main>
  )
}

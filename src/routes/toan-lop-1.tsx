import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/toan-lop-1')({
  head: () => ({
    meta: [
      { title: 'Toán Lớp 1 Online - Bé Học Cộng Trừ Vui Nhộn | Bé Vui Học' },
      {
        name: 'description',
        content:
          'Bé học toán lớp 1 online với bài tập tương tác, trò chơi cộng trừ trong phạm vi 10, 20. Miễn phí, không cần cài app, phụ huynh theo dõi tiến độ.',
      },
      { property: 'og:title', content: 'Toán Lớp 1 Online - Bé Học Cộng Trừ Vui Nhộn' },
      {
        property: 'og:description',
        content: 'Bài tập tương tác, trò chơi cộng trừ cho bé lớp 1. Học mà chơi, chơi mà học.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://bevuihoc.lovable.app/toan-lop-1' }],
  }),
  component: ToanLop1,
})

function ToanLop1() {
  return (
    <main>
      <h1>Toán Lớp 1 Online - Bé Học Cộng Trừ Vui Nhộn</h1>
      <p>
        Bé vừa vào lớp 1, làm quen với số đếm và phép tính đầu tiên. Bé Vui Học
        giúp bé học toán lớp 1 qua bài tập tương tác và trò chơi 3D, không áp lực,
        không chán.
      </p>

      <h2>Bé Học Gì Trong Toán Lớp 1?</h2>
      <p>Theo chương trình GDPT mới, toán lớp 1 gồm 4 nhóm kiến thức chính:</p>
      <h3>1. Số Đếm Từ 1 Đến 100</h3>
      <p>Nhận biết mặt số, đếm xuôi, đếm ngược, so sánh lớn bé.</p>
      <h3>2. Phép Cộng Trừ Trong Phạm Vi 10</h3>
      <p>Bé học cộng trừ qua hình ảnh trực quan, que tính, và trò chơi kéo thả.</p>
      <h3>3. Phép Cộng Trừ Trong Phạm Vi 20</h3>
      <p>Tính nhẩm, tính viết, giải toán có lời văn đơn giản.</p>
      <h3>4. Hình Học Cơ Bản</h3>
      <p>Nhận biết hình vuông, hình tròn, hình tam giác, hình chữ nhật.</p>

      <h2>Cách Bé Vui Học Giúp Bé Học Toán Lớp 1</h2>
      <ul>
        <li><strong>Bài tập tương tác:</strong> bé bấm chọn đáp án, kéo thả, nhận phản hồi ngay.</li>
        <li><strong>Trò chơi 3D:</strong> bé vào phòng học 3D, giải toán để mở khóa phần thưởng.</li>
        <li><strong>Theo dõi tiến độ:</strong> phụ huynh xem bé làm đúng bao nhiêu, mất bao lâu.</li>
        <li><strong>Không cần cài app:</strong> mở trình duyệt là học được, kể cả trên iPad.</li>
      </ul>

      <h2>Câu Hỏi Thường Gặp</h2>
      <h3>Bé Vui Học có miễn phí không?</h3>
      <p>Có. Các bài học toán lớp 1 cơ bản miễn phí hoàn toàn.</p>
      <h3>Bé cần chuẩn bị gì?</h3>
      <p>Chỉ cần máy tính, tablet hoặc điện thoại có kết nối internet.</p>
      <h3>Phụ huynh có theo dõi được không?</h3>
      <p>Có. Phụ huynh xem được tiến độ học của bé trong trang quản lý.</p>

      <div>
        <a href="/">← Về trang chủ Bé Vui Học</a>
        {' · '}
        <a href="/tieng-anh-lop-2">Học tiếng Anh lớp 2 →</a>
      </div>
    </main>
  )
}

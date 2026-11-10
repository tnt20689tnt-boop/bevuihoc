import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tieng-anh-lop-1')({
  head: () => ({
    meta: [
      { title: 'Tiếng Anh Lớp 1 Cho Bé - Học Bảng Chữ Cái, Số Đếm | Bé Vui Học' },
      {
        name: 'description',
        content:
          'Bé học tiếng Anh lớp 1 online: bảng chữ cái, số đếm 1-10, màu sắc, chào hỏi. Bài học qua hình ảnh, âm thanh, trò chơi. Miễn phí cho bé 6 tuổi.',
      },
      { property: 'og:title', content: 'Tiếng Anh Lớp 1 Cho Bé - Học Bảng Chữ Cái, Số Đếm' },
      {
        property: 'og:description',
        content: 'Bảng chữ cái, số đếm, màu sắc, chào hỏi cho bé lớp 1. Học qua trò chơi.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://bevuihoc.lovable.app/tieng-anh-lop-1' }],
  }),
  component: TiengAnhLop1,
})

function TiengAnhLop1() {
  return (
    <main>
      <h1>Tiếng Anh Lớp 1 Cho Bé - Học Bảng Chữ Cái, Số Đếm</h1>
      <p>
        Lớp 1 là lúc bé làm quen tiếng Anh lần đầu. Bé Vui Học bắt đầu từ những thứ
        gần gũi nhất: chữ cái, số đếm, màu sắc — qua hình ảnh và âm thanh, không
        gây áp lực.
      </p>

      <h2>Bé Học Gì Trong Tiếng Anh Lớp 1?</h2>
      <h3>1. Bảng Chữ Cái A-Z</h3>
      <p>Bé nhận biết mặt chữ, nghe phát âm, tập viết theo mẫu.</p>
      <h3>2. Số Đếm 1-10</h3>
      <p>Đếm bằng tiếng Anh qua bài hát, trò chơi đếm đồ vật.</p>
      <h3>3. Màu Sắc Cơ Bản</h3>
      <p>Red, blue, green, yellow… bé chọn màu đúng khi nghe.</p>
      <h3>4. Chào Hỏi Đơn Giản</h3>
      <p>"Hello", "Goodbye", "Thank you" — bé nghe và bắt chước.</p>

      <h2>Cách Bé Vui Học Giúp Bé Học Tiếng Anh Lớp 1</h2>
      <ul>
        <li><strong>Học qua hình ảnh:</strong> mỗi từ có hình minh họa, bé nhìn là hiểu.</li>
        <li><strong>Nghe phát âm chuẩn:</strong> bé bấm vào từ để nghe, bắt chước theo.</li>
        <li><strong>Trò chơi nhẹ nhàng:</strong> chọn hình đúng, nối từ với hình — không áp lực.</li>
        <li><strong>Phụ huynh theo dõi:</strong> xem bé nhớ được bao nhiêu từ mỗi tuần.</li>
      </ul>

      <h2>Câu Hỏi Thường Gặp</h2>
      <h3>Bé 6 tuổi học tiếng Anh có sớm không?</h3>
      <p>Không sớm. Đây là độ tuổi tốt để làm quen, miễn là học nhẹ nhàng, không ép.</p>
      <h3>Bé chưa biết chữ có học được không?</h3>
      <p>Được. Bài học dùng hình ảnh và âm thanh, bé không cần đọc nhiều.</p>

      <div>
        <a href="/">← Về trang chủ Bé Vui Học</a>
        {' · '}
        <a href="/tieng-anh-lop-2">Tiếng Anh lớp 2 →</a>
      </div>
    </main>
  )
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tieng-anh-lop-2')({
  head: () => ({
    meta: [
      { title: 'Tiếng Anh Lớp 2 Cho Bé - Học Từ Vựng Qua Trò Chơi | Bé Vui Học' },
      {
        name: 'description',
        content:
          'Bé học tiếng Anh lớp 2 online qua trò chơi từ vựng, luyện nghe phát âm chuẩn. Bài học sinh động, miễn phí, phù hợp bé 7-8 tuổi.',
      },
      { property: 'og:title', content: 'Tiếng Anh Lớp 2 Cho Bé - Học Từ Vựng Qua Trò Chơi' },
      {
        property: 'og:description',
        content: 'Trò chơi từ vựng, luyện nghe phát âm cho bé lớp 2. Học tiếng Anh không chán.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://bevuihoc.lovable.app/tieng-anh-lop-2' }],
  }),
  component: TiengAnhLop2,
})

function TiengAnhLop2() {
  return (
    <main>
      <h1>Tiếng Anh Lớp 2 Cho Bé - Học Từ Vựng Qua Trò Chơi</h1>
      <p>
        Lớp 2 là giai đoạn bé bắt đầu làm quen tiếng Anh một cách hệ thống. Bé Vui Học
        giúp bé học từ vựng, luyện nghe và phát âm qua trò chơi tương tác, không
        gây áp lực.
      </p>

      <h2>Bé Học Gì Trong Tiếng Anh Lớp 2?</h2>
      <h3>1. Từ Vựng Theo Chủ Đề</h3>
      <p>Gia đình, trường học, đồ vật, màu sắc, số đếm, động vật — mỗi chủ đề 10-15 từ.</p>
      <h3>2. Mẫu Câu Giao Tiếp Đơn Giản</h3>
      <p>"Hello, my name is…", "How are you?", "What is this?" — bé nghe và bắt chước.</p>
      <h3>3. Luyện Nghe Và Phát Âm</h3>
      <p>Bé nghe từ, chọn hình đúng; hoặc nghe câu, chọn nghĩa phù hợp.</p>
      <h3>4. Hát Và Chơi</h3>
      <p>Bài hát thiếu nhi tiếng Anh giúp bé nhớ từ tự nhiên.</p>

      <h2>Cách Bé Vui Học Giúp Bé Học Tiếng Anh Lớp 2</h2>
      <ul>
        <li><strong>Trò chơi từ vựng:</strong> bé kéo thả từ vào hình, nghe phát âm chuẩn.</li>
        <li><strong>Phòng học 3D:</strong> bé vào lớp 3D, tương tác với đồ vật để học từ mới.</li>
        <li><strong>Luyện nghe từng bước:</strong> từ đơn → câu ngắn → đoạn hội thoại.</li>
        <li><strong>Phụ huynh theo dõi:</strong> xem bé nhớ được bao nhiêu từ mỗi tuần.</li>
      </ul>

      <h2>Câu Hỏi Thường Gặp</h2>
      <h3>Bé chưa biết tiếng Anh có học được không?</h3>
      <p>Được. Bài học bắt đầu từ số 0, có hình ảnh và âm thanh minh họa.</p>
      <h3>Học trên điện thoại được không?</h3>
      <p>Được. Giao diện tối ưu cho cả điện thoại, tablet và máy tính.</p>

      <div>
        <a href="/">← Về trang chủ Bé Vui Học</a>
        {' · '}
        <a href="/tai-lieu-toan-lop-3">Tài liệu toán lớp 3 →</a>
      </div>
    </main>
  )
}

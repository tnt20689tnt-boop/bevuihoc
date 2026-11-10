import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/toan-lop-2')({
  head: () => ({
    meta: [
      { title: 'Toán Lớp 2 Online - Bé Học Cộng Trừ Có Nhớ, Bảng Nhân | Bé Vui Học' },
      {
        name: 'description',
        content:
          'Bé học toán lớp 2 online: cộng trừ có nhớ trong phạm vi 100, bảng nhân chia 2-5, đo lường, giải toán có lời văn. Bài tập tương tác, miễn phí.',
      },
      { property: 'og:title', content: 'Toán Lớp 2 Online - Bé Học Cộng Trừ Có Nhớ, Bảng Nhân' },
      {
        property: 'og:description',
        content: 'Cộng trừ có nhớ, bảng nhân chia 2-5, toán có lời văn cho bé lớp 2.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://bevuihoc.lovable.app/toan-lop-2' }],
  }),
  component: ToanLop2,
})

function ToanLop2() {
  return (
    <main>
      <h1>Toán Lớp 2 Online - Bé Học Cộng Trừ Có Nhớ, Bảng Nhân</h1>
      <p>
        Lớp 2 là năm bé chuyển từ đếm số sang tính toán có nhớ, và bắt đầu làm quen
        bảng nhân. Bé Vui Học giúp bé luyện từng bước, không bị quá tải.
      </p>

      <h2>Bé Học Gì Trong Toán Lớp 2?</h2>
      <h3>1. Cộng Trừ Có Nhớ Trong Phạm Vi 100</h3>
      <p>Đây là dạng bé hay nhầm nhất. Cần luyện đặt tính thẳng cột, nhớ đúng hàng.</p>
      <h3>2. Bảng Nhân Chia 2 Đến 5</h3>
      <p>Bé học qua hình ảnh nhóm đồ vật, sau đó luyện phản xạ.</p>
      <h3>3. Đo Lường</h3>
      <p>Đơn vị đo độ dài (cm, dm, m), khối lượng (kg), thời gian (giờ, phút).</p>
      <h3>4. Toán Có Lời Văn</h3>
      <p>Đọc đề, tóm tắt, chọn phép tính, trình bày bài giải.</p>

      <h2>Cách Bé Vui Học Giúp Bé Học Toán Lớp 2</h2>
      <ul>
        <li><strong>Luyện có nhớ từng bước:</strong> bé làm từng hàng, nhận phản hồi ngay khi sai.</li>
        <li><strong>Bảng nhân qua trò chơi:</strong> bé kéo thả, nghe nhạc, nhớ tự nhiên.</li>
        <li><strong>Phòng học 3D:</strong> bé vào lớp 3D, giải toán để mở khóa phần thưởng.</li>
        <li><strong>Phụ huynh theo dõi:</strong> xem bé yếu dạng nào để bổ sung.</li>
      </ul>

      <h2>Câu Hỏi Thường Gặp</h2>
      <h3>Bé lớp 2 chưa thuộc bảng nhân có sao không?</h3>
      <p>Không sao. Bắt đầu từ bảng 2, 5, 10 dễ nhất, rồi tăng dần.</p>
      <h3>Bé hay quên khi cộng có nhớ, làm sao?</h3>
      <p>Cho bé dùng que tính hoặc vẽ chấm tròn minh họa, sau đó mới bỏ dần.</p>

      <div>
        <a href="/toan-lop-1">← Toán lớp 1</a>
        {' · '}
        <a href="/toan-lop-3">Toán lớp 3 →</a>
      </div>
    </main>
  )
}

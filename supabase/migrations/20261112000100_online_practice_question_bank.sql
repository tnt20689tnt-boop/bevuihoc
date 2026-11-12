-- Online practice bank: add grade-specific questions without deleting existing content.
-- One curated set per grade/subject and difficulty; safe to re-run.
insert into public.question_bank
(subject, grade, term, topic, question_text, question_type, options, correct_answer, points, difficulty)
values
('math',1,'mid1','cộng trong phạm vi 10','7 + 2 = ?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','7'),jsonb_build_object('key','B','text','9'),jsonb_build_object('key','C','text','8'),jsonb_build_object('key','D','text','10')), 'A', 1, 1),
('math',1,'mid1','trừ trong phạm vi 10','9 - 4 = ?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','4'),jsonb_build_object('key','B','text','5'),jsonb_build_object('key','C','text','6'),jsonb_build_object('key','D','text','3')), 'B', 1, 2),
('math',1,'mid1','so sánh số','Số nào lớn hơn: 8 hay 5?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','5'),jsonb_build_object('key','B','text','8'),jsonb_build_object('key','C','text','Hai số bằng nhau'),jsonb_build_object('key','D','text','7')), 'B', 1, 3),
('math',2,'mid1','cộng có nhớ','34 + 25 = ?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','59'),jsonb_build_object('key','B','text','58'),jsonb_build_object('key','C','text','69'),jsonb_build_object('key','D','text','49')), 'A', 1, 1),
('math',2,'mid1','trừ có nhớ','72 - 38 = ?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','44'),jsonb_build_object('key','B','text','34'),jsonb_build_object('key','C','text','36'),jsonb_build_object('key','D','text','46')), 'B', 1, 2),
('math',2,'mid1','bảng nhân','4 × 7 = ?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','24'),jsonb_build_object('key','B','text','26'),jsonb_build_object('key','C','text','28'),jsonb_build_object('key','D','text','32')), 'C', 1, 3),
('math',3,'mid1','bảng nhân','8 × 7 = ?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','54'),jsonb_build_object('key','B','text','56'),jsonb_build_object('key','C','text','64'),jsonb_build_object('key','D','text','48')), 'B', 1, 1),
('math',3,'mid1','phép chia','72 ÷ 8 = ?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','8'),jsonb_build_object('key','B','text','9'),jsonb_build_object('key','C','text','10'),jsonb_build_object('key','D','text','7')), 'B', 1, 2),
('math',3,'mid1','chia có dư','29 chia 4 được thương và số dư nào?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','7 dư 1'),jsonb_build_object('key','B','text','6 dư 5'),jsonb_build_object('key','C','text','8 dư 1'),jsonb_build_object('key','D','text','7 dư 2')), 'A', 1, 3),
('math',4,'mid1','phân số','Phân số nào bằng một nửa?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','1/3'),jsonb_build_object('key','B','text','2/4'),jsonb_build_object('key','C','text','3/4'),jsonb_build_object('key','D','text','1/4')), 'B', 1, 1),
('math',4,'mid1','phân số','1/4 + 2/4 = ?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','2/4'),jsonb_build_object('key','B','text','3/4'),jsonb_build_object('key','C','text','3/8'),jsonb_build_object('key','D','text','1/2')), 'B', 1, 2),
('math',4,'mid1','chu vi hình chữ nhật','Hình chữ nhật dài 12 cm, rộng 5 cm. Chu vi là?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','17 cm'),jsonb_build_object('key','B','text','34 cm'),jsonb_build_object('key','C','text','60 cm'),jsonb_build_object('key','D','text','24 cm')), 'B', 1, 3),
('math',5,'mid1','số thập phân','3,25 + 1,5 = ?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','4,65'),jsonb_build_object('key','B','text','4,75'),jsonb_build_object('key','C','text','4,85'),jsonb_build_object('key','D','text','5,75')), 'B', 1, 1),
('math',5,'mid1','phần trăm','35% của 200 là bao nhiêu?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','60'),jsonb_build_object('key','B','text','65'),jsonb_build_object('key','C','text','70'),jsonb_build_object('key','D','text','75')), 'C', 1, 2),
('math',5,'mid1','thể tích','Hình hộp chữ nhật 4 cm, 3 cm, 5 cm có thể tích?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','12 cm³'),jsonb_build_object('key','B','text','20 cm³'),jsonb_build_object('key','C','text','60 cm³'),jsonb_build_object('key','D','text','40 cm³')), 'C', 1, 3),
('viet',1,'mid1','nhận biết âm vần','Tiếng nào bắt đầu bằng âm b?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','cá'),jsonb_build_object('key','B','text','bé'),jsonb_build_object('key','C','text','mẹ'),jsonb_build_object('key','D','text','hoa')), 'B', 1, 1),
('viet',1,'mid1','ghép tiếng','Chọn tiếng ghép với vần an tạo thành từ có nghĩa.', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','bàn'),jsonb_build_object('key','B','text','bân'),jsonb_build_object('key','C','text','băn'),jsonb_build_object('key','D','text','bạn')), 'A', 1, 2),
('viet',1,'mid1','câu đơn','Câu nào viết đúng cách?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','em yêu mẹ.'),jsonb_build_object('key','B','text','Em yêu mẹ.'),jsonb_build_object('key','C','text','em Yêu mẹ.'),jsonb_build_object('key','D','text','Em yêu mẹ')), 'B', 1, 3),
('viet',2,'mid1','từ chỉ sự vật','Từ nào chỉ đồ vật?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','chạy'),jsonb_build_object('key','B','text','cái cặp'),jsonb_build_object('key','C','text','xinh'),jsonb_build_object('key','D','text','nhanh')), 'B', 1, 1),
('viet',2,'mid1','từ chỉ hoạt động','Từ nào chỉ hoạt động?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','dịu dàng'),jsonb_build_object('key','B','text','quyển vở'),jsonb_build_object('key','C','text','nhảy múa'),jsonb_build_object('key','D','text','màu đỏ')), 'C', 1, 2),
('viet',2,'mid1','từ trái nghĩa','Trái nghĩa với chăm chỉ là từ nào?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','siêng năng'),jsonb_build_object('key','B','text','cần cù'),jsonb_build_object('key','C','text','lười biếng'),jsonb_build_object('key','D','text','chịu khó')), 'C', 1, 3),
('viet',3,'mid1','từ loại','Từ nào là danh từ?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','bầu trời'),jsonb_build_object('key','B','text','chạy'),jsonb_build_object('key','C','text','xanh'),jsonb_build_object('key','D','text','nhanh')), 'A', 1, 1),
('viet',3,'mid1','từ loại','Từ nào là động từ?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','lung linh'),jsonb_build_object('key','B','text','học tập'),jsonb_build_object('key','C','text','cao lớn'),jsonb_build_object('key','D','text','xanh biếc')), 'B', 1, 2),
('viet',3,'mid1','thành ngữ','Thành ngữ nào nói về tình yêu thương?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','Một cây làm chẳng nên non'),jsonb_build_object('key','B','text','Thương người như thể thương thân'),jsonb_build_object('key','C','text','Có công mài sắt có ngày nên kim'),jsonb_build_object('key','D','text','Đi một ngày đàng học một sàng khôn')), 'B', 1, 3),
('viet',4,'mid1','câu kể','Câu nào là câu kể Ai làm gì?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','Mẹ đang nấu cơm.'),jsonb_build_object('key','B','text','Bông hoa rất đẹp.'),jsonb_build_object('key','C','text','Mẹ là giáo viên.'),jsonb_build_object('key','D','text','Ôi, đẹp quá!')), 'A', 1, 1),
('viet',4,'mid1','từ ghép và từ láy','Từ nào là từ láy?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','bàn ghế'),jsonb_build_object('key','B','text','nhà cửa'),jsonb_build_object('key','C','text','long lanh'),jsonb_build_object('key','D','text','học sinh')), 'C', 1, 2),
('viet',4,'mid1','chủ ngữ vị ngữ','Trong câu “Những chú chim hót líu lo”, vị ngữ là gì?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','Những chú chim'),jsonb_build_object('key','B','text','chim hót'),jsonb_build_object('key','C','text','hót líu lo'),jsonb_build_object('key','D','text','líu lo')), 'C', 1, 3),
('viet',5,'mid1','đại từ','Đại từ trong câu “Chúng em chăm học” là từ nào?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','chăm'),jsonb_build_object('key','B','text','học'),jsonb_build_object('key','C','text','chúng em'),jsonb_build_object('key','D','text','em chăm')), 'C', 1, 1),
('viet',5,'mid1','quan hệ từ','Cặp quan hệ từ chỉ nguyên nhân – kết quả là gì?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','nếu… thì'),jsonb_build_object('key','B','text','vì… nên'),jsonb_build_object('key','C','text','tuy… nhưng'),jsonb_build_object('key','D','text','không những… mà còn')), 'B', 1, 2),
('viet',5,'mid1','câu ghép','Câu nào là câu ghép?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','Trời xanh.'),jsonb_build_object('key','B','text','Lan đọc sách, còn Minh làm bài.'),jsonb_build_object('key','C','text','Bông hoa đỏ thắm.'),jsonb_build_object('key','D','text','Chim hót trên cành.')), 'B', 1, 3),
('english',1,'mid1','alphabet','Which letter comes after C?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','B'),jsonb_build_object('key','B','text','D'),jsonb_build_object('key','C','text','E'),jsonb_build_object('key','D','text','A')), 'B', 1, 1),
('english',1,'mid1','vocabulary','What is “con gà” in English?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','A cat'),jsonb_build_object('key','B','text','A dog'),jsonb_build_object('key','C','text','A chicken'),jsonb_build_object('key','D','text','A fish')), 'C', 1, 2),
('english',1,'mid1','classroom objects','Choose the correct word for “cây bút”.', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','Pen'),jsonb_build_object('key','B','text','Pencil case'),jsonb_build_object('key','C','text','Ruler'),jsonb_build_object('key','D','text','Book')), 'A', 1, 3),
('english',2,'mid1','numbers','How do you spell the number 8?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','Seven'),jsonb_build_object('key','B','text','Eight'),jsonb_build_object('key','C','text','Nine'),jsonb_build_object('key','D','text','Ten')), 'B', 1, 1),
('english',2,'mid1','plural nouns','What is the plural of “book”?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','Bookes'),jsonb_build_object('key','B','text','Books'),jsonb_build_object('key','C','text','Bookies'),jsonb_build_object('key','D','text','Book')), 'B', 1, 2),
('english',2,'mid1','daily activities','Choose the correct sentence.', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','I goes to school.'),jsonb_build_object('key','B','text','I going to school.'),jsonb_build_object('key','C','text','I go to school.'),jsonb_build_object('key','D','text','I am go school.')), 'C', 1, 3),
('english',3,'mid1','to be','They ___ my classmates.', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','is'),jsonb_build_object('key','B','text','am'),jsonb_build_object('key','C','text','are'),jsonb_build_object('key','D','text','be')), 'C', 1, 1),
('english',3,'mid1','present simple','My brother ___ football every Sunday.', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','play'),jsonb_build_object('key','B','text','plays'),jsonb_build_object('key','C','text','playing'),jsonb_build_object('key','D','text','is play')), 'B', 1, 2),
('english',3,'mid1','there is there are','There ___ three pencils on the desk.', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','is'),jsonb_build_object('key','B','text','am'),jsonb_build_object('key','C','text','are'),jsonb_build_object('key','D','text','be')), 'C', 1, 3),
('english',4,'mid1','past simple','We ___ to the zoo yesterday.', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','go'),jsonb_build_object('key','B','text','goes'),jsonb_build_object('key','C','text','went'),jsonb_build_object('key','D','text','going')), 'C', 1, 1),
('english',4,'mid1','comparatives','A giraffe is ___ than a goat.', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','tall'),jsonb_build_object('key','B','text','taller'),jsonb_build_object('key','C','text','tallest'),jsonb_build_object('key','D','text','more tall')), 'B', 1, 2),
('english',4,'mid1','present continuous','Look! The children ___ in the garden.', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','play'),jsonb_build_object('key','B','text','plays'),jsonb_build_object('key','C','text','are playing'),jsonb_build_object('key','D','text','played')), 'C', 1, 3),
('english',5,'mid1','vocabulary','What does “environment” mean?', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','Môi trường'),jsonb_build_object('key','B','text','Thời tiết'),jsonb_build_object('key','C','text','Gia đình'),jsonb_build_object('key','D','text','Trường học')), 'A', 1, 1),
('english',5,'mid1','future simple','If it rains tomorrow, we ___ at home.', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','stay'),jsonb_build_object('key','B','text','stayed'),jsonb_build_object('key','C','text','will stay'),jsonb_build_object('key','D','text','staying')), 'C', 1, 2),
('english',5,'mid1','present perfect','She ___ her homework already.', 'multiple_choice', jsonb_build_array(jsonb_build_object('key','A','text','finish'),jsonb_build_object('key','B','text','finished'),jsonb_build_object('key','C','text','has finished'),jsonb_build_object('key','D','text','finishing')), 'C', 1, 3)
on conflict (subject, grade, term, question_text) do nothing;

create or replace function public.get_practice_questions(
  p_subject text,
  p_grade int,
  p_level int,
  p_count int default 5
)
returns table (
  id uuid,
  question_text text,
  options jsonb,
  correct_answer text,
  topic text,
  points int,
  difficulty int
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_target_difficulty int;
begin
  if v_user is null then raise exception 'Chưa đăng nhập'; end if;
  if p_subject not in ('math','viet','english') then raise exception 'Môn học không hợp lệ'; end if;
  if p_grade not between 1 and 5 then raise exception 'Lớp không hợp lệ'; end if;
  if p_level not between 1 and 100 then raise exception 'Cấp độ không hợp lệ'; end if;
  if p_count not between 1 and 20 then raise exception 'Số câu không hợp lệ'; end if;

  v_target_difficulty := case
    when p_level <= 33 then 1
    when p_level <= 66 then 2
    else 3
  end;

  return query
  with unique_bank as (
    select distinct on (lower(trim(q.question_text)))
      q.id, q.question_text, q.options, q.correct_answer, q.topic, q.points, q.difficulty
    from public.question_bank q
    where q.subject = p_subject
      and q.grade = p_grade
      and q.term = 'mid1'
      and q.question_type = 'multiple_choice'
      and jsonb_typeof(q.options) = 'array'
    order by lower(trim(q.question_text)), abs(q.difficulty - v_target_difficulty), q.created_at desc
  )
  select b.id, b.question_text, b.options, b.correct_answer, b.topic, b.points, b.difficulty
  from unique_bank b
  order by abs(b.difficulty - v_target_difficulty), random()
  limit p_count;
end;
$$;

revoke all on function public.get_practice_questions(text,int,int,int) from public, anon;
grant execute on function public.get_practice_questions(text,int,int,int) to authenticated;

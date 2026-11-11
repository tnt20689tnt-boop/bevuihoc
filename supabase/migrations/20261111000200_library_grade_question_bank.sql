-- Seed starter question bank for all 3 subjects and grades 1–5.
-- Answers remain server-side; this migration is safe to re-run.
with seed as (
  values
('math',1,'mid1','cộng trong phạm vi 10','2 + 3 = ?','multiple_choice','[{"key":"A","text":"4"},{"key":"B","text":"5"},{"key":"C","text":"6"}]'::jsonb,'B',1,1),
('math',1,'mid1','trừ trong phạm vi 10','6 - 2 = ?','multiple_choice','[{"key":"A","text":"3"},{"key":"B","text":"4"},{"key":"C","text":"5"}]'::jsonb,'B',1,1),
('math',1,'mid1','số liền sau','Số liền sau của 7 là số nào?','multiple_choice','[{"key":"A","text":"6"},{"key":"B","text":"8"},{"key":"C","text":"9"}]'::jsonb,'B',1,1),
('math',2,'mid1','cộng trong phạm vi 100','12 + 5 = ?','multiple_choice','[{"key":"A","text":"16"},{"key":"B","text":"17"},{"key":"C","text":"18"}]'::jsonb,'B',1,1),
('math',2,'mid1','trừ trong phạm vi 100','30 - 8 = ?','multiple_choice','[{"key":"A","text":"21"},{"key":"B","text":"22"},{"key":"C","text":"23"}]'::jsonb,'B',1,1),
('math',2,'mid1','bảng nhân','4 × 2 = ?','multiple_choice','[{"key":"A","text":"6"},{"key":"B","text":"8"},{"key":"C","text":"10"}]'::jsonb,'B',1,1),
('math',3,'mid1','bảng nhân','6 × 7 = ?','multiple_choice','[{"key":"A","text":"40"},{"key":"B","text":"42"},{"key":"C","text":"48"}]'::jsonb,'B',1,1),
('math',3,'mid1','phép chia','35 ÷ 5 = ?','multiple_choice','[{"key":"A","text":"6"},{"key":"B","text":"7"},{"key":"C","text":"8"}]'::jsonb,'B',1,1),
('math',3,'mid1','trừ trong phạm vi 1000','100 - 36 = ?','multiple_choice','[{"key":"A","text":"54"},{"key":"B","text":"64"},{"key":"C","text":"74"}]'::jsonb,'B',1,1),
('math',4,'mid1','phân số','1/2 + 1/4 = ?','multiple_choice','[{"key":"A","text":"2/4"},{"key":"B","text":"3/4"},{"key":"C","text":"1/4"}]'::jsonb,'B',1,1),
('math',4,'mid1','số thập phân','2,5 + 1,2 = ?','multiple_choice','[{"key":"A","text":"3,5"},{"key":"B","text":"3,7"},{"key":"C","text":"3,8"}]'::jsonb,'B',1,1),
('math',4,'mid1','phân số của một số','3/4 của 20 là bao nhiêu?','multiple_choice','[{"key":"A","text":"10"},{"key":"B","text":"15"},{"key":"C","text":"18"}]'::jsonb,'B',1,1),
('math',5,'mid1','số thập phân','1,25 + 2,5 = ?','multiple_choice','[{"key":"A","text":"3,25"},{"key":"B","text":"3,75"},{"key":"C","text":"4,00"}]'::jsonb,'B',1,1),
('math',5,'mid1','phần trăm','25% của 80 là bao nhiêu?','multiple_choice','[{"key":"A","text":"15"},{"key":"B","text":"20"},{"key":"C","text":"25"}]'::jsonb,'B',1,1),
('math',5,'mid1','phân số thập phân','3/5 viết dưới dạng số thập phân là?','multiple_choice','[{"key":"A","text":"0,3"},{"key":"B","text":"0,6"},{"key":"C","text":"0,8"}]'::jsonb,'B',1,1),
('viet',1,'mid1','nhận biết chữ','Chữ nào là chữ cái tiếng Việt?','multiple_choice','[{"key":"A","text":"1"},{"key":"B","text":"b"},{"key":"C","text":"?"}]'::jsonb,'B',1,1),
('viet',1,'mid1','từ chỉ người','Từ nào chỉ người?','multiple_choice','[{"key":"A","text":"bàn"},{"key":"B","text":"mẹ"},{"key":"C","text":"hoa"}]'::jsonb,'B',1,1),
('viet',1,'mid1','dấu câu','Cuối câu kể thường có dấu gì?','multiple_choice','[{"key":"A","text":"Dấu chấm"},{"key":"B","text":"Dấu hỏi"},{"key":"C","text":"Dấu phẩy"}]'::jsonb,'A',1,1),
('viet',2,'mid1','chính tả','Từ nào viết đúng chính tả?','multiple_choice','[{"key":"A","text":"chăm chỉ"},{"key":"B","text":"trăm chỉ"},{"key":"C","text":"chăm chĩ"}]'::jsonb,'A',1,1),
('viet',2,'mid1','từ chỉ hoạt động','Từ nào chỉ hoạt động?','multiple_choice','[{"key":"A","text":"bông hoa"},{"key":"B","text":"chạy"},{"key":"C","text":"màu đỏ"}]'::jsonb,'B',1,1),
('viet',2,'mid1','câu hỏi','Cuối câu hỏi dùng dấu nào?','multiple_choice','[{"key":"A","text":"Dấu chấm"},{"key":"B","text":"Dấu hỏi"},{"key":"C","text":"Dấu phẩy"}]'::jsonb,'B',1,1),
('viet',3,'mid1','từ loại','Từ nào là từ chỉ đặc điểm?','multiple_choice','[{"key":"A","text":"xanh"},{"key":"B","text":"chạy"},{"key":"C","text":"bàn"}]'::jsonb,'A',1,1),
('viet',3,'mid1','từ đồng nghĩa','Từ gần nghĩa với chăm chỉ là gì?','multiple_choice','[{"key":"A","text":"lười biếng"},{"key":"B","text":"siêng năng"},{"key":"C","text":"chậm chạp"}]'::jsonb,'B',1,1),
('viet',3,'mid1','câu kể','Câu nào là câu kể?','multiple_choice','[{"key":"A","text":"Bạn tên gì?"},{"key":"B","text":"Em đi học."},{"key":"C","text":"Ôi đẹp quá!"}]'::jsonb,'B',1,1),
('viet',4,'mid1','từ loại','Trong câu ''Chim hót líu lo'', từ nào chỉ hoạt động?','multiple_choice','[{"key":"A","text":"Chim"},{"key":"B","text":"hót"},{"key":"C","text":"líu lo"}]'::jsonb,'B',1,1),
('viet',4,'mid1','từ trái nghĩa','Từ trái nghĩa với dũng cảm là gì?','multiple_choice','[{"key":"A","text":"gan dạ"},{"key":"B","text":"nhút nhát"},{"key":"C","text":"mạnh mẽ"}]'::jsonb,'B',1,1),
('viet',4,'mid1','chủ ngữ','Trong câu ''Lan đang đọc sách'', ai đang đọc sách?','multiple_choice','[{"key":"A","text":"Lan"},{"key":"B","text":"sách"},{"key":"C","text":"đang"}]'::jsonb,'A',1,1),
('viet',5,'mid1','từ loại','Từ nào là quan hệ từ?','multiple_choice','[{"key":"A","text":"và"},{"key":"B","text":"đẹp"},{"key":"C","text":"chạy"}]'::jsonb,'A',1,1),
('viet',5,'mid1','từ trái nghĩa','Từ trái nghĩa với trung thực là gì?','multiple_choice','[{"key":"A","text":"thật thà"},{"key":"B","text":"gian dối"},{"key":"C","text":"ngay thẳng"}]'::jsonb,'B',1,1),
('viet',5,'mid1','câu ghép','Câu nào là câu ghép?','multiple_choice','[{"key":"A","text":"Trời mưa."},{"key":"B","text":"Lan học bài và Mai đọc sách."},{"key":"C","text":"Bông hoa rất đẹp."}]'::jsonb,'B',1,1),
('english',1,'mid1','alphabet','Which letter comes after A?','multiple_choice','[{"key":"A","text":"B"},{"key":"B","text":"C"},{"key":"C","text":"D"}]'::jsonb,'A',1,1),
('english',1,'mid1','numbers','What number is ''three''?','multiple_choice','[{"key":"A","text":"2"},{"key":"B","text":"3"},{"key":"C","text":"4"}]'::jsonb,'B',1,1),
('english',1,'mid1','colors','What color is ''red''?','multiple_choice','[{"key":"A","text":"Blue"},{"key":"B","text":"Red"},{"key":"C","text":"Green"}]'::jsonb,'B',1,1),
('english',2,'mid1','animals','What is ''cat'' in Vietnamese?','multiple_choice','[{"key":"A","text":"Con chó"},{"key":"B","text":"Con mèo"},{"key":"C","text":"Con cá"}]'::jsonb,'B',1,1),
('english',2,'mid1','colors','What color is the sky on a clear day?','multiple_choice','[{"key":"A","text":"Blue"},{"key":"B","text":"Black"},{"key":"C","text":"Pink"}]'::jsonb,'A',1,1),
('english',2,'mid1','greetings','What does ''Hello'' mean?','multiple_choice','[{"key":"A","text":"Tạm biệt"},{"key":"B","text":"Xin chào"},{"key":"C","text":"Cảm ơn"}]'::jsonb,'B',1,1),
('english',3,'mid1','vocabulary','What does ''apple'' mean?','multiple_choice','[{"key":"A","text":"Quả táo"},{"key":"B","text":"Quả cam"},{"key":"C","text":"Quả chuối"}]'::jsonb,'A',1,1),
('english',3,'mid1','grammar','Choose the correct sentence.','multiple_choice','[{"key":"A","text":"I am a student."},{"key":"B","text":"I is a student."},{"key":"C","text":"I are a student."}]'::jsonb,'A',1,1),
('english',3,'mid1','numbers','How do you write số five?','multiple_choice','[{"key":"A","text":"Four"},{"key":"B","text":"Five"},{"key":"C","text":"Six"}]'::jsonb,'B',1,1),
('english',4,'mid1','grammar','She ___ my friend.','multiple_choice','[{"key":"A","text":"am"},{"key":"B","text":"is"},{"key":"C","text":"are"}]'::jsonb,'B',1,1),
('english',4,'mid1','vocabulary','What is the opposite of ''big''?','multiple_choice','[{"key":"A","text":"Small"},{"key":"B","text":"Tall"},{"key":"C","text":"Long"}]'::jsonb,'A',1,1),
('english',4,'mid1','present simple','Choose the correct sentence.','multiple_choice','[{"key":"A","text":"He play football."},{"key":"B","text":"He plays football."},{"key":"C","text":"He playing football."}]'::jsonb,'B',1,1),
('english',5,'mid1','grammar','Yesterday, I ___ to school.','multiple_choice','[{"key":"A","text":"go"},{"key":"B","text":"went"},{"key":"C","text":"goes"}]'::jsonb,'B',1,1),
('english',5,'mid1','vocabulary','What does ''carefully'' mean?','multiple_choice','[{"key":"A","text":"Một cách cẩn thận"},{"key":"B","text":"Nhanh chóng"},{"key":"C","text":"Ồn ào"}]'::jsonb,'A',1,1),
('english',5,'mid1','grammar','There ___ two books on the table.','multiple_choice','[{"key":"A","text":"is"},{"key":"B","text":"are"},{"key":"C","text":"am"}]'::jsonb,'B',1,1))
insert into public.question_bank
(subject, grade, term, topic, question_text, question_type, options, correct_answer, points, difficulty)
select s.column1, s.column2, terms.term, s.column4, s.column5, s.column6, s.column7, s.column8, s.column9, s.column10
from seed s
cross join (values ('mid1'), ('final1'), ('mid2'), ('final2')) as terms(term)
on conflict (subject, grade, term, question_text) do nothing;

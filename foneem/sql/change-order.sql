-- find largest:
-- select s.display_order, s.id, s.sentence from sentences s order by length(s.sentence) desc limit 10;
-- display_order:
-- select s.id, s.sentence from sentences as s where s.id NOT IN(select s.id from users u, sentences s, user_sentence_session us  where  s.id = us.sentence_id and u.id = us.user_id and u.email = 'v@empty-set.net') order by s.display_order limit 10;

update sentences set display_order = 596 where id = 0;
update sentences set display_order = 21 where id = 1;
update sentences set display_order = 18 where id = 2;
update sentences set display_order = 0 where id = 596;
update sentences set display_order = 1 where id = 21;
update sentences set display_order = 2 where id = 18;

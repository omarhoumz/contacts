insert into public.labels (user_id, name, color)
select id, 'Friends', '#3b82f6' from auth.users
on conflict do nothing;

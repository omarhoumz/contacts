-- One default label per user (requires unique (user_id, name) from migration 20260422).
insert into public.labels (user_id, name, color)
select id, 'Friends', '#3b82f6'
from auth.users
on conflict (user_id, name) do nothing;

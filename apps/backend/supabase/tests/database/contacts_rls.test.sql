-- RLS checks for public.contacts and contact_labels (two distinct auth users).
-- Run: cd apps/backend && npx supabase test db

begin;

create extension if not exists pgtap with schema extensions;

select plan(5);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'rls_user_a@test.local'),
  ('22222222-2222-4222-8222-222222222222', 'rls_user_b@test.local');

insert into public.contacts (id, user_id, display_name)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'User A contact');

insert into public.labels (id, user_id, name, color)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'B label', '#00ff00');

-- As User B: cannot see User A's row
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select results_eq(
  $$select count(*)::bigint from public.contacts where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid$$,
  $$values (0::bigint)$$,
  'User B select on A contact id returns no rows'
);

-- As User B: cannot update A's contact
with u as (
  update public.contacts
  set display_name = 'hacked-by-b'
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid
  returning id
)
select is((select count(*)::bigint from u), 0::bigint, 'User B update on A contact affects zero rows');

-- As User B: cannot delete A's contact
with u as (
  delete from public.contacts
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid
  returning id
)
select is((select count(*)::bigint from u), 0::bigint, 'User B delete on A contact affects zero rows');

-- As User B: cannot attach own label to A's contact (RLS with_check)
select throws_ok(
  $$insert into public.contact_labels (contact_id, label_id, user_id)
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid,
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid,
      '22222222-2222-4222-8222-222222222222'::uuid
    )$$,
  '42501'
);

-- As User A: can read own contact
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select results_eq(
  $$select display_name from public.contacts where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid$$,
  $$values ('User A contact'::text)$$,
  'User A can read own contact'
);

select * from finish();

rollback;

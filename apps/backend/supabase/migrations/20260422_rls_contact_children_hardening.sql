-- Ensure label names are unique per user (idempotent seed + UX).
create unique index if not exists labels_user_id_name_key
  on public.labels (user_id, name);

-- Child rows must belong to the same user as the parent contact (and label, for contact_labels).
drop policy if exists "contact_emails own rows" on public.contact_emails;
create policy "contact_emails own rows" on public.contact_emails
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_emails.contact_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_emails.contact_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "contact_phones own rows" on public.contact_phones;
create policy "contact_phones own rows" on public.contact_phones
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_phones.contact_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_phones.contact_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "contact_addresses own rows" on public.contact_addresses;
create policy "contact_addresses own rows" on public.contact_addresses
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_addresses.contact_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_addresses.contact_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "contact_labels own rows" on public.contact_labels;
create policy "contact_labels own rows" on public.contact_labels
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_labels.contact_id
        and c.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.labels l
      where l.id = contact_labels.label_id
        and l.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.contacts c
      where c.id = contact_labels.contact_id
        and c.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.labels l
      where l.id = contact_labels.label_id
        and l.user_id = auth.uid()
    )
  );

-- Pin search_path on security definer triggers (Postgres hardening).
alter function public.handle_new_user() set search_path = public;
alter function public.set_updated_at() set search_path = public;

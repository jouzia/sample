create table if not exists projects(id bigint generated always as identity primary key,created_at timestamptz default now(),title text not null,slug text unique,description text not null,tags text[] default '{}',live_url text,github_url text,image_url text,is_featured boolean default false,published boolean default true,problem text,solution text,features text[] default '{}',learning text);
create table if not exists certificates(id bigint generated always as identity primary key,created_at timestamptz default now(),title text not null,issuer text not null,date date,pdf_url text not null,category text default 'Professional',description text,published boolean default true);
create table if not exists achievements(id bigint generated always as identity primary key,created_at timestamptz default now(),title text not null,organization text,achievement_date date,description text,status text default 'COMPLETED',link text,published boolean default true);
create table if not exists programs(id bigint generated always as identity primary key,created_at timestamptz default now(),name text not null,organization text,type text,description text,program_date date,status text default 'PARTICIPATED',url text,image_url text,published boolean default true);
alter table projects enable row level security;alter table certificates enable row level security;alter table achievements enable row level security;alter table programs enable row level security;
create policy "public read published projects" on projects for select using(published=true);
create policy "public read published certificates" on certificates for select using(published=true);
create policy "public read published achievements" on achievements for select using(published=true);
create policy "public read published programs" on programs for select using(published=true);
create policy "authenticated manage projects" on projects for all to authenticated using(true) with check(true);
create policy "authenticated manage certificates" on certificates for all to authenticated using(true) with check(true);
create policy "authenticated manage achievements" on achievements for all to authenticated using(true) with check(true);
create policy "authenticated manage programs" on programs for all to authenticated using(true) with check(true);
-- Create a Storage bucket named certificates and add authenticated Storage RLS policies before enabling uploads.

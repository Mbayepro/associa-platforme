-- Fix invalid encode('base64url') in member_cards

ALTER TABLE public.member_cards
ALTER COLUMN verification_token 
SET DEFAULT replace(replace(replace(encode(gen_random_bytes(24), 'base64'), '+', '-'), '/', '_'), '=', '');

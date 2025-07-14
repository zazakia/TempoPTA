DO $ BEGIN
    CREATE TYPE payment_category AS ENUM ('pta_fee', 'school_supplies', 'field_trip', 'uniform', 'books', 'activities', 'fundraising', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS category payment_category DEFAULT 'pta_fee'::payment_category;

alter publication supabase_realtime add table payments;

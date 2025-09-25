--
-- PostgreSQL database dump
--

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
    ) THEN
        CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
            LANGUAGE plpgsql
            AS $func$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$;
    END IF;
END $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    stripe_payment_id character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    product_type character varying(20) NOT NULL,
    product_id uuid,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    stripe_payment_intent_id character varying(255)
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_template_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    subscription_types jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    product_license_template jsonb
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: software_licenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.software_licenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    license_type character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    purchased_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subscriptions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    licensee_number character varying(255),
    license_number character varying(255)
);


--
-- Name: zoom_meetings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.zoom_meetings (
    id SERIAL PRIMARY KEY,
    meeting_id text NOT NULL,
    meeting_url text NOT NULL,
    passcode text NOT NULL,
    is_active boolean DEFAULT true,
    required_subscription_tier text NOT NULL DEFAULT 'basic'
        CHECK (required_subscription_tier IN ('basic', 'premium')),
    CONSTRAINT zoom_meetings_meeting_id_unique UNIQUE (meeting_id)
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    google_id character varying(255),
    is_email_verified boolean DEFAULT false,
    reset_token character varying(255),
    reset_token_expires timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    methodology_disclaimer_viewed boolean DEFAULT false,
    methodology_disclaimer_viewed_date timestamp without time zone
);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_pkey') THEN
        ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
    END IF;
END $$;


--
-- Name: payments payments_stripe_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_stripe_payment_id_key') THEN
        ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_stripe_payment_id_key UNIQUE (stripe_payment_id);
    END IF;
END $$;


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_pkey') THEN
        ALTER TABLE ONLY public.products ADD CONSTRAINT products_pkey PRIMARY KEY (id);
    END IF;
END $$;


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey') THEN
        ALTER TABLE ONLY public.session ADD CONSTRAINT session_pkey PRIMARY KEY (sid);
    END IF;
END $$;


--
-- Name: software_licenses software_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'software_licenses_pkey') THEN
        ALTER TABLE ONLY public.software_licenses ADD CONSTRAINT software_licenses_pkey PRIMARY KEY (id);
    END IF;
END $$;


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_subscriptions_pkey') THEN
        ALTER TABLE ONLY public.user_subscriptions ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);
    END IF;
END $$;


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key') THEN
        ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END $$;


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_google_id_key') THEN
        ALTER TABLE ONLY public.users ADD CONSTRAINT users_google_id_key UNIQUE (google_id);
    END IF;
END $$;


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_pkey') THEN
        ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
    END IF;
END $$;


--
-- Name: idx_payments_stripe_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON public.payments USING btree (stripe_payment_id);


--
-- Name: idx_payments_stripe_payment_intent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments USING btree (stripe_payment_intent_id);


--
-- Name: idx_payments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments USING btree (user_id);


--
-- Name: idx_products_license_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_products_license_template ON public.products USING btree (product_license_template);


--
-- Name: idx_products_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_products_template_id ON public.products USING btree (product_template_id);


--
-- Name: idx_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_session_expire ON public.session USING btree (expire);


--
-- Name: idx_user_subscriptions_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_data ON public.user_subscriptions USING gin (subscriptions);


--
-- Name: idx_user_subscriptions_license_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_license_number ON public.user_subscriptions USING btree (license_number);


--
-- Name: idx_user_subscriptions_licensee_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_licensee_number ON public.user_subscriptions USING btree (licensee_number);


--
-- Name: idx_user_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_google_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users USING btree (google_id);


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at') THEN CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF; END $$;


--
-- Name: software_licenses update_software_licenses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_software_licenses_updated_at') THEN CREATE TRIGGER update_software_licenses_updated_at BEFORE UPDATE ON public.software_licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF; END $$;


--
-- Name: user_subscriptions update_user_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_subscriptions_updated_at') THEN CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF; END $$;


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); END IF; END $$;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_user_id_fkey') THEN
        ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;


--
-- Name: software_licenses software_licenses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'software_licenses_user_id_fkey') THEN
        ALTER TABLE ONLY public.software_licenses ADD CONSTRAINT software_licenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;


--
-- Name: user_subscriptions user_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_subscriptions_user_id_fkey') THEN
        ALTER TABLE ONLY public.user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;


--
-- PostgreSQL database dump complete
--

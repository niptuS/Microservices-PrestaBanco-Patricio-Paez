-- PostgreSQL database dump
--
-- Ajustado para evitar valores nulos en las columnas id_customer e id_loan.

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request (
                                id_request integer NOT NULL,
                                status integer NOT NULL,
                                id_customer bigint NOT NULL,
                                id_loan bigint NOT NULL
);

ALTER TABLE public.request OWNER TO postgres;

--
-- Name: request_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.request_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.request_seq OWNER TO postgres;

--
-- Data for Name: request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request (id_request, status, id_customer, id_loan) FROM stdin;
1	2	1	1
\.

--
-- Name: request_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.request_seq', 1, true);

--
-- PostgreSQL database dump complete
--
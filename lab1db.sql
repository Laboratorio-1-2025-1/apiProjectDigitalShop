--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-0+deb12u2)
-- Dumped by pg_dump version 15.12 (Debian 15.12-0+deb12u2)

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
-- Name: adminexample; Type: SCHEMA; Schema: -; Owner: adminexample
--

CREATE SCHEMA adminexample;


ALTER SCHEMA adminexample OWNER TO adminexample;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: client; Type: TABLE; Schema: adminexample; Owner: postgres
--

CREATE TABLE adminexample.client (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    mail character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    status character(1) DEFAULT 'a'::bpchar
);


ALTER TABLE adminexample.client OWNER TO postgres;

--
-- Name: clientorder; Type: TABLE; Schema: adminexample; Owner: postgres
--

CREATE TABLE adminexample.clientorder (
    id integer NOT NULL,
    startdate date NOT NULL,
    totalamount numeric(10,2) NOT NULL,
    status character(1) DEFAULT 'a'::bpchar NOT NULL,
    clientid integer
);


ALTER TABLE adminexample.clientorder OWNER TO postgres;

--
-- Name: orderdetail; Type: TABLE; Schema: adminexample; Owner: postgres
--

CREATE TABLE adminexample.orderdetail (
    id integer NOT NULL,
    orderid integer,
    productid integer,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax numeric(10,2) NOT NULL,
    discount numeric(10,2) NOT NULL,
    CONSTRAINT orderdetail_price_check CHECK ((price > (0)::numeric)),
    CONSTRAINT orderdetail_subtotal_check CHECK ((subtotal > (0)::numeric))
);


ALTER TABLE adminexample.orderdetail OWNER TO postgres;

--
-- Name: product; Type: TABLE; Schema: adminexample; Owner: postgres
--

CREATE TABLE adminexample.product (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    unitprice numeric(10,2) NOT NULL,
    stock integer NOT NULL,
    taxinfo character(1) NOT NULL,
    CONSTRAINT product_unitprice_check CHECK ((unitprice > (0)::numeric))
);


ALTER TABLE adminexample.product OWNER TO postgres;

--
-- Name: receipt; Type: TABLE; Schema: adminexample; Owner: postgres
--

CREATE TABLE adminexample.receipt (
    id integer NOT NULL,
    receiptnr integer NOT NULL,
    emitdate date NOT NULL,
    totalamount numeric(10,2) NOT NULL,
    clientid integer,
    shopid integer,
    status character(1) DEFAULT 'e'::bpchar NOT NULL
);


ALTER TABLE adminexample.receipt OWNER TO postgres;

--
-- Name: receiptdetail; Type: TABLE; Schema: adminexample; Owner: postgres
--

CREATE TABLE adminexample.receiptdetail (
    id integer NOT NULL,
    receiptid integer,
    productid integer,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax numeric(10,2) NOT NULL,
    discount numeric(10,2) NOT NULL,
    CONSTRAINT receiptdetail_price_check CHECK ((price > (0)::numeric))
);


ALTER TABLE adminexample.receiptdetail OWNER TO postgres;

--
-- Name: role; Type: TABLE; Schema: adminexample; Owner: postgres
--

CREATE TABLE adminexample.role (
    id integer NOT NULL,
    description character varying(255),
    status character(1) NOT NULL
);


ALTER TABLE adminexample.role OWNER TO postgres;

--
-- Name: shop; Type: TABLE; Schema: adminexample; Owner: postgres
--

CREATE TABLE adminexample.shop (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    mail character varying(255) NOT NULL,
    legalinfo character varying(255) NOT NULL
);


ALTER TABLE adminexample.shop OWNER TO postgres;

--
-- Name: userapp; Type: TABLE; Schema: adminexample; Owner: postgres
--

CREATE TABLE adminexample.userapp (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    roleid integer,
    status character(1) NOT NULL,
    creationdate date NOT NULL
);


ALTER TABLE adminexample.userapp OWNER TO postgres;

--
-- Data for Name: client; Type: TABLE DATA; Schema: adminexample; Owner: postgres
--

COPY adminexample.client (id, name, lastname, mail, phone, address, status) FROM stdin;
1	Andreasi	Alvarado	example@mail.com	55512353	1st Venue	a
2	Andreina	Valencia	example@mail.com	5551555	2nd Venue	i
\.


--
-- Data for Name: clientorder; Type: TABLE DATA; Schema: adminexample; Owner: postgres
--

COPY adminexample.clientorder (id, startdate, totalamount, status, clientid) FROM stdin;
1	2025-04-07	0.00	a	1
\.


--
-- Data for Name: orderdetail; Type: TABLE DATA; Schema: adminexample; Owner: postgres
--

COPY adminexample.orderdetail (id, orderid, productid, quantity, price, subtotal, tax, discount) FROM stdin;
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: adminexample; Owner: postgres
--

COPY adminexample.product (id, name, description, category, unitprice, stock, taxinfo) FROM stdin;
1	doritos	snack	edible	99.99	100	i
\.


--
-- Data for Name: receipt; Type: TABLE DATA; Schema: adminexample; Owner: postgres
--

COPY adminexample.receipt (id, receiptnr, emitdate, totalamount, clientid, shopid, status) FROM stdin;
\.


--
-- Data for Name: receiptdetail; Type: TABLE DATA; Schema: adminexample; Owner: postgres
--

COPY adminexample.receiptdetail (id, receiptid, productid, quantity, price, subtotal, tax, discount) FROM stdin;
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: adminexample; Owner: postgres
--

COPY adminexample.role (id, description, status) FROM stdin;
\.


--
-- Data for Name: shop; Type: TABLE DATA; Schema: adminexample; Owner: postgres
--

COPY adminexample.shop (id, name, address, mail, legalinfo) FROM stdin;
\.


--
-- Data for Name: userapp; Type: TABLE DATA; Schema: adminexample; Owner: postgres
--

COPY adminexample.userapp (id, username, password, roleid, status, creationdate) FROM stdin;
\.


--
-- Name: client client_pkey; Type: CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (id);


--
-- Name: clientorder clientorder_pkey; Type: CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.clientorder
    ADD CONSTRAINT clientorder_pkey PRIMARY KEY (id);


--
-- Name: orderdetail orderdetail_pkey; Type: CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.orderdetail
    ADD CONSTRAINT orderdetail_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: receipt receipt_pkey; Type: CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.receipt
    ADD CONSTRAINT receipt_pkey PRIMARY KEY (id);


--
-- Name: receiptdetail receiptdetail_pkey; Type: CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.receiptdetail
    ADD CONSTRAINT receiptdetail_pkey PRIMARY KEY (id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: shop shop_pkey; Type: CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.shop
    ADD CONSTRAINT shop_pkey PRIMARY KEY (id);


--
-- Name: userapp userapp_pkey; Type: CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.userapp
    ADD CONSTRAINT userapp_pkey PRIMARY KEY (id);


--
-- Name: clientorder clientorder_clientid_fkey; Type: FK CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.clientorder
    ADD CONSTRAINT clientorder_clientid_fkey FOREIGN KEY (clientid) REFERENCES adminexample.client(id);


--
-- Name: orderdetail orderdetail_orderid_fkey; Type: FK CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.orderdetail
    ADD CONSTRAINT orderdetail_orderid_fkey FOREIGN KEY (orderid) REFERENCES adminexample.clientorder(id);


--
-- Name: orderdetail orderdetail_productid_fkey; Type: FK CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.orderdetail
    ADD CONSTRAINT orderdetail_productid_fkey FOREIGN KEY (productid) REFERENCES adminexample.product(id);


--
-- Name: receipt receipt_clientid_fkey; Type: FK CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.receipt
    ADD CONSTRAINT receipt_clientid_fkey FOREIGN KEY (clientid) REFERENCES adminexample.client(id);


--
-- Name: receipt receipt_shopid_fkey; Type: FK CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.receipt
    ADD CONSTRAINT receipt_shopid_fkey FOREIGN KEY (shopid) REFERENCES adminexample.shop(id);


--
-- Name: receiptdetail receiptdetail_productid_fkey; Type: FK CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.receiptdetail
    ADD CONSTRAINT receiptdetail_productid_fkey FOREIGN KEY (productid) REFERENCES adminexample.product(id);


--
-- Name: receiptdetail receiptdetail_receiptid_fkey; Type: FK CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.receiptdetail
    ADD CONSTRAINT receiptdetail_receiptid_fkey FOREIGN KEY (receiptid) REFERENCES adminexample.receipt(id);


--
-- Name: userapp userapp_roleid_fkey; Type: FK CONSTRAINT; Schema: adminexample; Owner: postgres
--

ALTER TABLE ONLY adminexample.userapp
    ADD CONSTRAINT userapp_roleid_fkey FOREIGN KEY (roleid) REFERENCES adminexample.role(id);


--
-- Name: TABLE client; Type: ACL; Schema: adminexample; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE adminexample.client TO adminexample;


--
-- Name: TABLE clientorder; Type: ACL; Schema: adminexample; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE adminexample.clientorder TO adminexample;


--
-- Name: TABLE orderdetail; Type: ACL; Schema: adminexample; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE adminexample.orderdetail TO adminexample;


--
-- Name: TABLE product; Type: ACL; Schema: adminexample; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE adminexample.product TO adminexample;


--
-- Name: TABLE receipt; Type: ACL; Schema: adminexample; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE adminexample.receipt TO adminexample;


--
-- Name: TABLE receiptdetail; Type: ACL; Schema: adminexample; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE adminexample.receiptdetail TO adminexample;


--
-- Name: TABLE role; Type: ACL; Schema: adminexample; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE adminexample.role TO adminexample;


--
-- Name: TABLE shop; Type: ACL; Schema: adminexample; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE adminexample.shop TO adminexample;


--
-- Name: TABLE userapp; Type: ACL; Schema: adminexample; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE adminexample.userapp TO adminexample;


--
-- PostgreSQL database dump complete
--


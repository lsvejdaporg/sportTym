CREATE TABLE `sporttym_hraci` (
                                  `id` int(11) NOT NULL,
                                  `jmeno` varchar(100) COLLATE utf8_czech_ci NOT NULL,
                                  `prijmeni` varchar(100) COLLATE utf8_czech_ci NOT NULL,
                                  `rok_narozeni` int(4) NOT NULL,
                                  `cislo_dresu` int(2) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;


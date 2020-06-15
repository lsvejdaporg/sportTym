CREATE TABLE `sporttym_hraci` (
                                  `id` int(11) NOT NULL,
                                  `jmeno` varchar(100) COLLATE utf8_czech_ci NOT NULL,
                                  `prijmeni` varchar(100) COLLATE utf8_czech_ci NOT NULL,
                                  `rok_narozeni` int(4) NOT NULL,
                                  `cislo_dresu` int(2) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;

CREATE TABLE `sporttym_zapasy` (
                                   `id` int(11) NOT NULL,
                                   `datum` varchar(12) COLLATE utf8_czech_ci NOT NULL,
                                   `cas` varchar(12) COLLATE utf8_czech_ci NOT NULL,
                                   `misto` varchar(100) COLLATE utf8_czech_ci NOT NULL,
                                   `souper` varchar(100) COLLATE utf8_czech_ci NOT NULL,
                                   `skore` varchar(10) COLLATE utf8_czech_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;

CREATE TABLE `sporttym_nominace` (
                                     `zapasy_id` int(11) NOT NULL,
                                     `hraci_id` int(11) NOT NULL,
                                     `je_nominovan` tinyint(1) NOT NULL DEFAULT 0,
                                     `goly` int(11) NOT NULL DEFAULT 0,
                                     `asistence` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;

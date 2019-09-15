-- MySQL dump 10.13  Distrib 8.0.16, for Win64 (x86_64)
--
-- Host: localhost    Database: mapbook
-- ------------------------------------------------------
-- Server version	8.0.16

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `map`
--

DROP TABLE IF EXISTS `map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `map` (
  `map_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `longitude` decimal(15,9) NOT NULL,
  `latitude` decimal(15,9) NOT NULL,
  `place_icon` varchar(50) DEFAULT NULL,
  `information` text,
  `picture` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`map_id`),
  KEY `name` (`name`),
  KEY `address` (`address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `map`
--

LOCK TABLES `map` WRITE;
/*!40000 ALTER TABLE `map` DISABLE KEYS */;
/*!40000 ALTER TABLE `map` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `map_category`
--

DROP TABLE IF EXISTS `map_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `map_category` (
  `No` bigint(20) NOT NULL AUTO_INCREMENT,
  `address` varchar(255) NOT NULL,
  `category` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`No`),
  KEY `address` (`address`),
  CONSTRAINT `map_category_ibfk_1` FOREIGN KEY (`address`) REFERENCES `map` (`address`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `map_category`
--

LOCK TABLES `map_category` WRITE;
/*!40000 ALTER TABLE `map_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `map_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user` (
  `user_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `provider` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `access_token` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_map_copy`
--

DROP TABLE IF EXISTS `user_map_copy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_map_copy` (
  `No` bigint(20) NOT NULL AUTO_INCREMENT,
  `list_id` bigint(20) NOT NULL,
  `copy_user_name` varchar(50) NOT NULL,
  PRIMARY KEY (`No`),
  KEY `list_id` (`list_id`),
  CONSTRAINT `user_map_copy_ibfk_1` FOREIGN KEY (`list_id`) REFERENCES `user_map_list` (`list_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_map_copy`
--

LOCK TABLES `user_map_copy` WRITE;
/*!40000 ALTER TABLE `user_map_copy` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_map_copy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_map_list`
--

DROP TABLE IF EXISTS `user_map_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_map_list` (
  `list_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `category` varchar(30) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `list_name` varchar(50) NOT NULL,
  `list_icon` varchar(50) DEFAULT NULL,
  `appear_list` varchar(10) DEFAULT NULL,
  `copy_number` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`list_id`),
  KEY `user_name` (`user_name`,`list_name`,`list_icon`,`appear_list`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_map_list`
--

LOCK TABLES `user_map_list` WRITE;
/*!40000 ALTER TABLE `user_map_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_map_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_map_place`
--

DROP TABLE IF EXISTS `user_map_place`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_map_place` (
  `No` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(50) NOT NULL,
  `list_name` varchar(50) NOT NULL,
  `list_icon` varchar(50) DEFAULT NULL,
  `appear_list` varchar(10) DEFAULT NULL,
  `place_name` varchar(255) NOT NULL,
  `place_order` bigint(20) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `longitude` decimal(15,9) NOT NULL,
  `latitude` decimal(15,9) NOT NULL,
  `appear_place` varchar(10) DEFAULT NULL,
  `information` text,
  PRIMARY KEY (`No`),
  KEY `user_name` (`user_name`,`list_name`,`list_icon`,`appear_list`),
  KEY `place_name` (`place_name`),
  CONSTRAINT `user_map_place_ibfk_1` FOREIGN KEY (`user_name`, `list_name`, `list_icon`, `appear_list`) REFERENCES `user_map_list` (`user_name`, `list_name`, `list_icon`, `appear_list`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_map_place_ibfk_2` FOREIGN KEY (`place_name`) REFERENCES `map` (`name`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_map_place`
--

LOCK TABLES `user_map_place` WRITE;
/*!40000 ALTER TABLE `user_map_place` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_map_place` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-09-15 17:35:16

-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: boothera
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Applications`
--

DROP TABLE IF EXISTS `Applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Applications` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `product_category` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `booth_id` int NOT NULL,
  PRIMARY KEY (`application_id`),
  KEY `user_id` (`user_id`),
  KEY `event_id` (`event_id`),
  KEY `booth_id` (`booth_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `Events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `applications_ibfk_3` FOREIGN KEY (`booth_id`) REFERENCES `Booth` (`booth_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Applications`
--

LOCK TABLES `Applications` WRITE;
/*!40000 ALTER TABLE `Applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `Applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Booth`
--

DROP TABLE IF EXISTS `Booth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Booth` (
  `booth_id` int NOT NULL AUTO_INCREMENT,
  `booth_number` varchar(50) NOT NULL,
  `availability` varchar(50) NOT NULL,
  `event_id` int NOT NULL,
  PRIMARY KEY (`booth_id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `booth_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Booth`
--

LOCK TABLES `Booth` WRITE;
/*!40000 ALTER TABLE `Booth` DISABLE KEYS */;
INSERT INTO `Booth` VALUES (3,'A-01','1',1),(4,'A-02','1',1),(5,'A-03','1',1),(6,'A-04','1',1),(7,'A-05','1',1),(8,'A-06','1',1),(9,'A-07','1',1),(10,'A-08','1',1),(11,'A-09','1',1),(12,'A-10','1',1),(13,'A-01','1',3),(14,'A-02','1',3),(15,'A-03','1',3),(16,'A-04','1',3),(17,'A-05','1',3),(18,'A-06','1',3),(19,'A-07','1',3),(20,'A-08','1',3),(21,'A-09','1',3),(22,'A-10','1',3),(23,'A-01','1',8),(24,'A-02','1',8),(25,'A-03','1',8),(26,'A-04','1',8),(27,'A-05','1',8),(28,'A-06','1',8),(29,'A-07','1',8),(30,'A-08','1',8),(31,'A-09','1',8),(32,'A-10','1',8),(33,'A-11','1',8),(34,'A-12','1',8),(35,'A-13','1',8),(36,'A-14','1',8),(37,'A-15','1',8),(38,'A-01','1',9),(39,'A-02','1',9),(40,'A-03','1',9),(41,'A-04','1',9),(42,'A-05','1',9),(43,'A-06','1',9),(44,'A-07','1',9),(45,'A-08','1',9),(46,'A-09','1',9),(47,'A-10','1',9),(48,'A-11','1',9),(49,'A-12','1',9),(50,'A-13','1',9),(51,'A-14','1',9),(52,'A-15','1',9);
/*!40000 ALTER TABLE `Booth` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) NOT NULL,
  `venue` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `description` text,
  `booth_price` decimal(10,2) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES (1,'BoothEra Food Festival 2026','Johor Bahru Convention Centre','2026-08-15','10:00:00','A grand gathering of local and international street food vendors.',150.00,1),(3,'Tech & Gadget Expo','Kuala Lumpur Exhibition Hall','2026-07-15','09:00:00','The ultimate annual gathering for tech enthusiasts and innovators. Discover cutting-edge gadgets, wearable technology, and future tech trends all under one roof.',100.00,1),(8,'BoothEra Comic & Gaming Con 2026','Mid Valley Exhibition Centre','2026-09-20','10:00:00','The biggest gathering for ACG fans, featuring esports tournaments, indie game showcases, and creative art booths. Book your slot to reach thousands of passionate gamers and anime fans.',120.00,1),(9,'Artisan & Craft Autumn Market','Publika Creative Retail Space','2026-10-15','11:00:00','A cozy seasonal market dedicated to handmade crafts, personalized gifts, indie fashion labels, and organic treats. Perfect for local creators and startup brands looking for high foot traffic.',80.00,1);
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Message`
--

DROP TABLE IF EXISTS `Message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Message` (
  `m_id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `reply` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int NOT NULL,
  PRIMARY KEY (`m_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Message`
--

LOCK TABLES `Message` WRITE;
/*!40000 ALTER TABLE `Message` DISABLE KEYS */;
INSERT INTO `Message` VALUES (1,'Booth Query','Hi, I would like to ask if there are still booths available for the food zone?','Yes, we still have 3 booths left in Zone A.','2026-07-12 17:42:06',1),(2,'Refund Issue','Can I cancel my booth application and get a full refund?',NULL,'2026-07-12 17:42:06',2);
/*!40000 ALTER TABLE `Message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `e-mail` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `business_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `unique_email` (`e-mail`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Admin Test','123456789','admin@test.com','root','admin','BoothEra HQ'),(2,'User Test','987654321','user@test.com','pass','user','Normal Business'),(3,'Ben','01111112345','ben@gmail.com','pass','user','Ben Stationary'),(5,'Ali','01111112346','ali@gmail.com','root','user','Ali Burger');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-16 16:57:14

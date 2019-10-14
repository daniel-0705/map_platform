# mapBook

This website is like Google Map and My Maps, a platform where you can search for locations and save them to your lists. Saved lists can be shared among users and be viewed with different color schemes.

Website URL: https://www.daniel0705.com

## Table of Contents

- [Technologies](#Technologies)
- [Architecture](#Architecture)
- [Database Schema](#Database-Schema)
- [Main Features](#Main-Features)
- [Demonstration](#Demonstration)
  - [Main Page](#Main-Page)
  - [List Search](#List-Search )
  - [Copy Other List](#Copy-Other-List)
  - [Point of Interest and Address Search](#Point-of-Interest-and-Address-Search)
  - [Create and Edit List](#Create-and-Edit-List)
  - [Hide and Display List](#Hide-and-Display-List)
- [API Doc](https://github.com/daniel-0705/map_platform/blob/master/Doc/API%20Doc.md)
- [Contact](#Contact)

## Technologies

#### Backend
- Node.js / Express.js
- Web Crawler (cheerio)
- CI / CD (Jenkins)
- SSL Certificate (Let's Encrypt)
- NGINX

#### Front-End
- HTML
- CSS
- JavaScript
- AJAX

#### Database
 - MySQL
 - CRUD
 - Index, Primary key, Foreign key
 - Transaction
 - Redis (Cache)

#### Cloud Service (AWS)
- EC2

#### Networking
- HTTP & HTTPS
- Domain Name System(DNS)

#### Tool
- Git / GitHub
- Unit Test: Jest

#### Third Party
- Facebook Login API
- Google Maps API
- Google Geocoding API

## Architecture 

<p align="center">
 <img src="https://i.imgur.com/3ItZQPM.png"
 width="800">
</p>

- After receiving requests from clients through 443 port, NGINX forwards requests to corresponding ports according to domain names.
- Collected data from 33 different sources using public API and web crawler, and store them into database
- Set up automatic monthly web crawler activity, to ensure and data is up to date 
- Used Redis as cache solution for better response time






## Database Schema

<p align="center">
 <img src="https://i.imgur.com/LrMoqlz.png"
 width="800">
</p>

## Main Features
- List Search
    - Search other users' public lists
- Address or Point of Interest Search
    - Render relevant Address or Point of Interest 
- Create and Edit user own list
    - User can save point of interest to personal list. It can be shared among users and be viewed with different color schemes.
- Hide and Display list
    - User can manage personal lists by hiding or displaying, to see these in map clearly
- Member System
    - Supports Facebook Login

## Demonstration

### Main Page
<p align="center">
 <img src="https://media.giphy.com/media/XckIQhnOrJ7IizlVDT/giphy.gif" width="800">
</p>

- Responsive and dynamic map rendering

---

### List Search 

<p align="center">
 <img src="https://media.giphy.com/media/THNy14CzzLVrqSUmAY/giphy.gif" width="800">
</p>

- User can type keywords to search other users' public lists
- Results are rendered by word segmentation, for example **"台北十大電影院"**，will be rendered by **台北十大**，**十大電影院**，**台北**，**電影院** etc. keywords
- Clicking the list title can display or hide the marker

---

### Copy Other List

<p align="center">
 <img src="https://media.giphy.com/media/ftf4tUA3N2z6JR8Nk2/giphy.gif" width="800">
</p>

- Member only function
- You can copy other user's list and it will show up your map instantly

---

### Point of Interest and Address Search

<p align="center">
 <img src="https://media.giphy.com/media/dwQzavOhjUwpDAQcVv/giphy.gif" width="800">
</p>


- User can search both point of interest and address by the same keywords
- After clicking on a point of interest, the map will move accordingly and display that point of interest at the center of screen, and user can decide whether or not to collect it into personal list 


---

### Create and Edit List

<p align="center">
 <img src="https://media.giphy.com/media/YqX3RBWAOr97JKZZeY/giphy.gif" width="800">
</p>

- Users can create and edit personal list with different colors, and the changes will be updated and displayed instantly

---

### Hide and Display List

<p align="center">
 <img src="https://media.giphy.com/media/Z9JFbtx4LGMjRiyVSQ/giphy.gif" width="800">
</p>

- User can manage personal lists by hiding or displaying, to see these in map clearly
---


## Contact

#### Email:  lsps60711@hotmail.com

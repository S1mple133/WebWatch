<<<<<<< HEAD
# Web Watch
## Description
This project should give people the opportunity to store snapshots of websites at a given time.

## Project Information
Organization: HTL Leonding
Project Title: Web Watch
Timeframe: N/A
Prepared By: Aichinger Niklas,
Pavelescu Darius

## How to Use WebWatch
### Creating an Account

To start using webwatch, you will need an account, so hit the "Sign-Up" button and create an account.

![](github_content/img/sign_up.PNG "Signup")

After you did that, visit the Sign-Up page again and click on the Log-in Button to log in.

![](github_content/img/log_in.PNG "Login")

### Taking a Snapshot
After being logged in, you should visit "Save Website" from the navigation bar.
Paste the link in the "URL" input bar and click on the Submit button.
Wait patiently until you get redirected to the homepage.

![](github_content/img/save_website.png "Save Website")

### Viewing your saved websites
After storing the website, you can easily access it by visiting the "Show Websites" menu from the navbar.

![](github_content/img/show_website.png "Show Websites")

## Project Summary
### Technical Details
The actual Files are saved in PDF and HTML format on our servers to minimize the price that the user has to pay to store a website on the blockchain.

The next step is to create a unique Hash. The hash uses the MD5-Algorithm and it contains the HTML Code of the website and its URL.

The web3 Library lets us connect to the ethereum blockchain, but in order to connect to it, we would also need a Node, which is running in the blockchain. The Infura API helps us with this problem by allowing us to use their Node to Deploy Contracts in the ethereum network.

The hash is then stored in the blockchain and it is linked to the user that requested the snapshot.
When the user wants to see the website, we use the same algorithms to hash the HTML code thats stored on our servers. If the calculated hash is the same as the hash that’s stored on the blockchain, it means that the files did not change. The user becomes 2 links. One leads him to the PDF and the other one to the HTML.

## Project Methodology
### Aproach Summary
#### aproach
By using blockchain we are guaranteed that everything thats saved is unchangeable/ undeleteable. Which in our case will be hashes of a website. The website source code will be stored on our servers to reduce cost.

#### organization
We will have meetings where we discuss a new feature which we then implement together or alone. After every feature we will push our code to github from where the next member of the project can continue to work.

#### tools

⋅⋅⋅ Tools we used

⋅⋅⋅ethereum blockchain
⋅⋅⋅bootstrap
⋅⋅⋅nodejs
    ⋅⋅⋅web3 - Access blockchain from nodejs.
    ⋅⋅⋅Infura API - Node on the eth blockchain.
    
#### addressing changes
As mentioned in the aproach we will have meetings in form of a in person conversation, a call of some kind or via chat. After we discussed how we will implement certain changes we than use visual studio code live share to work together on the same change or we will decide who will implement the change. After the change is finished the member/members who worked on the change will then proceed to push the code to github.
=======
# WebWatch
>>>>>>> 95e227fba2dc3257b9f339356a034dea32050b7d

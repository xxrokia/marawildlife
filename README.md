Documentation instructions
Running the Web Application

Visit the GitHub repository link: https://github.com/xxrokia/marawildlife.git
Download the code as a zip file and open it in your code editor (e.g., Visual Studio Code).
In the terminal of your code editor in the frontend directory, run the command: npm start.
In the terminal of your code editor in the backend directory, run the command: node server.js
Ensure the server is running, then open your web browser and navigate to: http://localhost:3000.
The application will now be successfully launched.
For training and evaluation of the model, in the terminal of your code editor in the script directory, run the command: train_model.py 

You  can access the database, download it and add it to your MongoDB compass. 
Here is the link to the Maasai Mara Mongo db database folder link: https://drive.google.com/drive/folders/1Ng3DJC3b7JVJBiWBPY4_2lYHBCl1aTEc?usp=sharing 
and Maasai Mara Mongo db database zip file link  : https://drive.google.com/file/d/1yZGJiy-CFoe_4QZldROIUjPTjlPZp8Sq/view?usp=sharing

Go to the database zip file link and click "Download" to save maasai_mara_backup.zip.
Navigate to the download directory and unzip the file to create the maasai_mara_backup folder:
unzip maasai_mara_backup.zip.
Open MongoDB Compass and connect to your MongoDB instance (mongodb://localhost:27017) to restore the database
In the terminal, navigate to the backup folder and restore the database:
cd /path/to/maasai_mara_backup
mongorestore --db maasai_mara ./maasai_mara_backup
Then Refresh MongoDB Compass to see maasai_mara and ensure all collections and data are restored correctly.

# Data Visualization - FTA Team 
- Francisco García Barrada
- Tom Lorée
- Arshia Navabakbar

Using a dataset of informatio about 5 million trees from Kaggle to analyze interesting information and create appropiate visualizations to help understanding the context.

Link to the dataset: https://www.kaggle.com/datasets/mexwell/5m-trees-dataset/data?select=Durham_Final_2022-06-18.csv


## Setup
As the dataset is composed of 64 csv files (one for each city), it occupies a lot of memory, which makes it difficult to preprocess in a GitHub environment.
We decided to upload all this files to the repository using Git Large File Storage (LFS) and this way all team members can access them.
Setting up LFS for the repository was an easy task following the instructions given in the official page, where it was necessary to run some commands on the Git Command Line.

After this, the team decided to use Python to merge all this datasets and be able to analyze it.

import pymongo
import pandas as pd
from pymongo import MongoClient
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
import matplotlib.pyplot as plt
import datetime

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['maasai_mara']
animals_collection = db['animals']

# Load data from MongoDB collections into DataFrames
animals_data = list(animals_collection.find())

df_animals = pd.DataFrame(animals_data)

# Check if the data was loaded correctly
if df_animals.empty:
    raise ValueError("No data found in the 'animals' collection")

# Extract movements_history data and flatten it
movements_history_data = []
for animal in animals_data:
    if 'movements_history' in animal:
        for movement in animal['movements_history']:
            if 'timestamp' in movement:
                movement_data = {
                    'animal_id': animal['_id'],
                    'species': animal['species'],
                    'age': animal['age'],
                    'latitude': movement['latitude'],
                    'longitude': movement['longitude'],
                    'speed': movement['speed'],
                    'distance_traveled': movement['distance_traveled'],
                    'timestamp': movement['timestamp'],
                    'terrain_type': animal['terrain_type'],
                    'weather_condition': animal['weather_condition']
                }
                movements_history_data.append(movement_data)

df_movements = pd.DataFrame(movements_history_data)

# Check if 'timestamp' is present in the DataFrame
if 'timestamp' not in df_movements.columns:
    raise KeyError("The 'timestamp' field is missing in the data.")

# Convert timestamp to time of day
df_movements['time_of_day'] = pd.to_datetime(df_movements['timestamp']).dt.hour

# Preprocess Data
# Handle missing values
df_movements = df_movements.dropna()

# Select features and target variable
required_columns = ['latitude', 'longitude', 'speed', 'terrain_type', 'weather_condition', 'time_of_day']
if not all(col in df_movements.columns for col in required_columns):
    raise ValueError(f"DataFrame is missing one of the required columns: {required_columns}")

# Extract features and target variable
X = df_movements[['latitude', 'longitude', 'terrain_type', 'weather_condition', 'time_of_day']]
y = df_movements['speed']

# Preprocess the data using ColumnTransformer and Pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), ['latitude', 'longitude', 'time_of_day']),
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['terrain_type', 'weather_condition'])
    ])

# Define the model
rf = RandomForestRegressor()

# Define hyperparameters to tune
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20, 30],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

# Use GridSearchCV to find the best hyperparameters
grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, n_jobs=-1, verbose=2)

# Create the pipeline
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('grid_search', grid_search)
])

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
pipeline.fit(X_train, y_train)

# Best parameters
best_params = grid_search.best_params_
print("Best parameters found: ", best_params)

# Make predictions
y_pred = pipeline.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f'Mean Squared Error: {mse}')
print(f'R^2 Score: {r2}')

# Plot residuals
residuals = y_test - y_pred
plt.scatter(y_test, residuals)
plt.hlines(0, min(y_test), max(y_test), colors='red')
plt.xlabel('True Values')
plt.ylabel('Residuals')
plt.title('Residuals Plot')
plt.show()

# If using RandomForestRegressor, get feature importances
importances = grid_search.best_estimator_.feature_importances_
feature_names = preprocessor.transformers_[0][2] + list(grid_search.best_estimator_.named_steps['preprocessor'].transformers_[1][1].get_feature_names_out())
importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
importance_df = importance_df.sort_values('Importance', ascending=False)
print(importance_df)

# Plot feature importances
plt.figure(figsize=(10, 6))
plt.barh(importance_df['Feature'], importance_df['Importance'])
plt.xlabel('Importance')
plt.ylabel('Feature')
plt.title('Feature Importances')
plt.gca().invert_yaxis()
plt.show()

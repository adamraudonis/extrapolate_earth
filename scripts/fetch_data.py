import pandas as pd
import requests
from io import StringIO

def fetch_data(dataset_name, country='World', start_year=1900):
    """
    Fetches data from the specified dataset for a given country and time range.

    Parameters:
        dataset_name (str): The name of the dataset to fetch.
        country (str): The country to filter the data for. Defaults to 'World'.
        start_year (int): The starting year for the data range. Defaults to 1900.

    Returns:
        df_filtered (DataFrame): A pandas DataFrame containing the filtered data.
    """
    # Define the base URL for the dataset
    base_url = f"https://raw.githubusercontent.com/owid/co2-data/master/{dataset_name}.csv"

    # Fetch the data using requests
    response = requests.get(base_url)

    # Raise an exception if the request was unsuccessful
    if response.status_code != 200:
        raise ValueError(f"Failed to fetch data: {response.status_code}")

    # Load the data into a pandas DataFrame
    df = pd.read_csv(StringIO(response.text))

    # Check if the specified country is in the 'country' column
    if country not in df['country'].unique():
        raise ValueError(f"'{country}' not found in the 'country' column.")

    # Determine the range of years available in the data
    year_range = df['year'].unique()
    print(f"Year range in data: {year_range.min()} - {year_range.max()}")

    # Filter the DataFrame for the specified country and time range
    df_filtered = df[(df['country'] == country) & (df['year'] >= start_year)]

    return df_filtered

# If this script is run as the main program, fetch the data and print it
if __name__ == "__main__":
    try:
        # Example usage: Fetch CO2 data for 'World' from 1900
        data = fetch_data('owid-co2-data', 'World', 1900)
        print(data)
    except ValueError as e:
        # Print the error if there is an issue fetching the data
        print(e)
import pandas as pd
import requests
from io import StringIO


def fetch_data(dataset_name, entity="World", start_year=1900, end_year=None):
    """
    Fetches data from the specified dataset for a given entity and time range.

    Parameters:
        dataset_name (str): The name of the dataset to fetch.
        entity (str): The entity to filter the data for. Defaults to 'World'.
        start_year (int): The starting year for the data range. Defaults to 1900.
        end_year (int): The ending year for the data range. If None, fetches up to the latest available year.

    Returns:
        df_filtered (DataFrame): A pandas DataFrame containing the filtered data.
    """
    # Define the base URL for the dataset
    # The URL is constructed dynamically to accommodate different datasets
    # Adjusted to account for different repository structures
    if dataset_name == "co2-data":
        base_url = (
            "https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv"
        )
    elif dataset_name == "covid-19-data":
        base_url = "https://covid.ourworldindata.org/data/owid-covid-data.csv"
    elif dataset_name == "total-population":
        base_url = "https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/Total%20population%20-%20Gapminder%2C%20UN%20Population%20Division/Total%20population%20-%20Gapminder%2C%20UN%20Population%20Division.csv"
    elif dataset_name == "global-hunger-index":
        base_url = "https://raw.githubusercontent.com/owid/owid-datasets/master/datasets/Global Hunger Index in 2017 (listed 2017) (Global Hunger Index 2017)/Global Hunger Index in 2017 (listed 2017) (Global Hunger Index 2017).csv"
    else:
        base_url = f"https://raw.githubusercontent.com/owid/{dataset_name}/master/public/data/{dataset_name}.csv"

    print(f"Requesting data from URL: {base_url}")  # Log the URL being requested

    # Fetch the data using requests
    response = requests.get(base_url)

    print(
        f"Response status code: {response.status_code}"
    )  # Log the response status code
    print(f"Response headers: {response.headers}")  # Log the response headers

    # Raise an exception if the request was unsuccessful
    if response.status_code != 200:
        raise ValueError(f"Failed to fetch data: {response.status_code}")

    # Load the data into a pandas DataFrame
    df = pd.read_csv(StringIO(response.text))

    # Check if the specified entity is in the 'Entity' column
    if entity not in df["Entity"].unique():
        raise ValueError(f"'{entity}' not found in the 'Entity' column.")

    # Filter the DataFrame for the specified entity and time range
    df_filtered = df[(df["Entity"] == entity) & (df["Year"] >= start_year)]
    if end_year:
        df_filtered = df_filtered[df_filtered["Year"] <= end_year]

    return df_filtered


# If this script is run as the main program, fetch the data and print it
if __name__ == "__main__":
    try:
        # Example usage: Fetch global hunger index data for 'India' from 2017
        data = fetch_data("global-hunger-index", "India", 2017)
        print(data)
    except ValueError as e:
        # Print the error if there is an issue fetching the data
        print(e)

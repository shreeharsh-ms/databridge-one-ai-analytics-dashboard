import requests

# Replace with your actual Render API key
API_KEY = "rnd_Kj7KVI1swU0nzsJzg0tPsY71SyeV"

# URL to fetch all services (or deploy a specific one)
url = "https://api.render.com/v1/services"

# Set the Authorization header
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Make the GET request
response = requests.get(url, headers=headers)

# Print response JSON
print(response.status_code)
print(response.json())


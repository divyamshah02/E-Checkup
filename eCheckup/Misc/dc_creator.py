import pandas as pd
import requests



base_url = "https://echeckup.ericsontpa.com/"


import secrets

def generate_password(count=1):
    words = [
        "Tiger", "Lion", "Panther", "Eagle", "Shark", "Wolf", "Falcon", "Dragon", "Phoenix", "Bear",
        "Cobra", "Viper", "Leopard", "Jaguar", "Rhino", "Buffalo", "Horse", "Cheetah", "Hawk",
        "Whale", "Dolphin", "Octopus", "Crab", "Turtle", "Frog", "Panda", "Koala", "Gorilla", "Monkey",
        "Camel", "Zebra", "Deer", "Rabbit", "Goat", "Sheep", "Dog", "Cat", "Fox", "Pig",
        "Blue", "Red", "Green", "Black", "White", "Gold", "Silver", "Yellow", "Orange", "Purple",
        "Storm", "Cloud", "Rain", "Thunder", "Lightning", "Wind", "Snow", "Fire", "Ice", "Stone",
        "River", "Ocean", "Sea", "Lake", "Desert", "Forest", "Mountain", "Valley", "Sky", "Earth",
        "Star", "Moon", "Sun", "Planet", "Galaxy", "Comet", "Meteor", "Cosmos", "Orbit", "Space",
        "Happy", "Smart", "Brave", "Strong", "Fast", "Quick", "Calm", "Quiet", "Lucky", "Wise"
    ]
    symbols = "!@#$%&*"

    passwords = []
    for _ in range(count):
        word = secrets.choice(words)
        symbol = secrets.choice(symbols)
        number = str(secrets.randbelow(10000)).zfill(4)  # always 4 digits
        passwords.append(f"{word}{symbol}{number}")

    return passwords if count > 1 else passwords[0]



# def create_user(name
# , password
# , contact_number
# , email
# , role
# , contact_person
# , address
# , city
# , state
# , pincode):
#     url = f"{base_url}user-api/user-api/"
#     data = {
#         "name": name,
#         "password": password,
#         "contact_number": contact_number,
#         "email": email,
#         "role": role,
#         "contact_person": contact_person,
#         "address": address,
#         "city": city,
#         "state": state,
#         "pincode": pincode
#     }
#     response = requests.post(url, json=data)
#     return response.json()


# df = pd.read_excel(r"C:\Users\Divyam Shah\Downloads\DIAGNOSTIC CENTER LIST-2025(New) (1) (1).xlsx")
# created_users = []
# failed_users = []
# for index, row in df.iterrows():
#     # import pdb; pdb.set_trace()
#     try:
#         name = row['Diagnostic Centre']
#         password = generate_password()
#         contact_number = str(row['Contact no.'])
#         email = row['Email id']
#         role = "diagnostic_center"
#         contact_person = row['Con. Name']
#         address = row['Centre Address']
#         city = row['City']
#         state = row['State']
#         pincode = str(row['Pincode'])
#         print(index+1)
#         print(name)
#         print(password)
#         print(contact_number)
#         print(email)
#         print(role)
#         print(contact_person)
#         print(address)
#         print(city)
#         print(state)
#         print(pincode)
#         print("-----")
#         result = create_user(name, password, contact_number, email, role, contact_person, address, city, state, pincode)
#         if result['success'] == True:
#             created_users.append({
#                 'name': name,
#                 'password': password,
#                 'email': email,
#                 'contact_number': contact_number
#             })
#         else:
#             failed_users.append({
#                 'name': name,
#                 'email': email,
#                 'contact_number': contact_number,
#                 'error': str(result)
#             })
#         print(f"Created user {name}: {result}")
#     except Exception as e:
#         print(f"Failed to create user for {row['Diagnostic Centre']}: {e} : {result}")
#         continue

# pd.DataFrame(created_users).to_excel("created_diagnostic_centers.xlsx", index=False)
# pd.DataFrame(failed_users).to_excel("error_diagnostic_centers.xlsx", index=False)

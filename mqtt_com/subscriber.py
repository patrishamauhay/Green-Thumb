import paho.mqtt.client as mqtt
import firebase_admin
from firebase_admin import credentials, firestore
import json
import time

# Initialize Firebase
cred = credentials.Certificate("C:/Users/patri/Documents/Publish-Subscriber/serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# MQTT Configuration
MQTT_BROKER = "test.mosquitto.org"
MQTT_TOPIC = "greenthumb"

def get_active_user():
    """Fetch the user who has activated the sensor."""
    try:
        users_ref = db.collection("users").where("activeSensorUser", ">", "").limit(1)
        users_docs = users_ref.get()

        for user_doc in users_docs:
            print(f"✅ Found active user: {user_doc.id}")
            return user_doc.id  # ✅ Return the first active user found

    except Exception as e:
        print(f"🔥 Error fetching active user: {e}")
    
    return None  # No active user found


def get_active_plant(user_id):
    """Fetch the currently active plant for the user."""
    try:
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            plant_id = user_data.get("activeSensorPlant")  # ✅ Use .get() to avoid KeyError
            print(f"✅ Found active plant for user {user_id}: {plant_id}")
            return str(plant_id) if plant_id else None

    except Exception as e:
        print(f"🔥 Error fetching active plant for user {user_id}: {e}")
    
    return None  # No active plant found


def store_sensor_data(user_id, plant_id, light, soil_moisture):
    """Store sensor data in Firestore for the active plant."""
    if not user_id:
        print("⚠️ No active user found.")
        return
    if not plant_id:
        print("⚠️ No plant is assigned to receive sensor data.")
        return

    try:
        # Reference to the plant document
        sensor_ref = db.collection("users").document(user_id).collection("myGarden").document(plant_id)

        # ✅ Update latest sensor reading directly (overwrite old)
        sensor_ref.set({
            "latestSensorData": {
                "Light": light,
                "Soil Moisture": soil_moisture,
                "timestamp": firestore.SERVER_TIMESTAMP
            }
        }, merge=True)

        print(f"✅ Updated latest sensor data for plant {plant_id}: Light {light}%, Soil Moisture {soil_moisture}%")

    except Exception as e:
        print(f"🔥 Error storing sensor data: {e}")

def on_connect(client, userdata, flags, rc):
    """Handle connection to MQTT broker and subscribe to topic."""
    if rc == 0:
        print("✅ Connected to MQTT Broker successfully")
        client.subscribe(MQTT_TOPIC)  # ✅ Now subscribing to receive data
    else:
        print(f"🔥 Connection failed with code {rc}")

def on_message(client, userdata, msg):
    """Handle received MQTT messages."""
    try:
        payload = json.loads(msg.payload.decode())
        light = float(payload.get("Light", 0))
        soil_moisture = float(payload.get("Soil Moisture", 0))

        user_id = get_active_user()  # ✅ Get the active user
        if not user_id:
            print("⚠️ No user has activated a sensor.")
            return

        plant_id = get_active_plant(user_id)  # ✅ Get the active plant
        if not plant_id:
            print("⚠️ No active plant assigned to user.")
            return

        store_sensor_data(user_id, plant_id, light, soil_moisture)  # ✅ Save sensor data to Firestore

    except json.JSONDecodeError:
        print("🔥 Received invalid JSON data from MQTT topic")
    except Exception as e:
        print(f"🔥 Error processing MQTT message: {e}")

def connect_mqtt():
    """Handles MQTT connection with auto-reconnect."""
    global client
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message

    while True:
        try:
            print("🔄 Attempting to connect to MQTT broker...")
            client.connect(MQTT_BROKER, 1883, 60)
            client.loop_forever()
        except Exception as e:
            print(f"🔥 MQTT Connection Error: {e}, retrying in 5 seconds...")
            time.sleep(5)

# Start MQTT Connection with Auto-Reconnect
connect_mqtt()

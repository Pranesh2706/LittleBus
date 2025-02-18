import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, FlatList, 
  TouchableOpacity, StyleSheet, Alert, Button 
} from "react-native";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { Buffer } from "buffer";
import { useNavigation } from "@react-navigation/native"; 

const username = "demo@test";  
const password = "demo@abhibus";  

const Home = () => {
  const navigation = useNavigation(); 

  const [date, setDate] = useState(""); // State for current date
  const [source, setSource] = useState(""); 
  const [destination, setDestination] = useState(""); 
  const [stations, setStations] = useState([]); 
  const [destinationStations, setDestinationStations] = useState([]); 
  const [showSourceDropdown, setShowSourceDropdown] = useState(false); 
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false); 
  const [selectedSourceId, setSelectedSourceId] = useState(null); 

  useEffect(() => {
    // Get current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
    setDate(formattedDate);
  }, []);

  const processSOAPResponse = async (soapResponse, name) => {
    try {
      const parser = new XMLParser({
        ignoreAttributes: true,
        parseNodeValue: true,
        alwaysCreateTextNode: true,
      });

      const parsedSOAP = parser.parse(soapResponse);
      console.log("Parsed SOAP:", parsedSOAP);

      const getResult =
        parsedSOAP["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]?.[
          `ns1:${name}Response`
        ]?.[`ns1:${name}Result`]?.["#text"];

      console.log("Extracted Result:", getResult);

      if (getResult) {
        const jsonObject = JSON.parse(getResult);
        console.log("Converted JSON Object:", jsonObject);
        return jsonObject;
      } else {
        console.error(`No valid '${name}Result' found in the response`);
        return null;
      }
    } catch (error) {
      console.error("Error processing SOAP response:", error);
      return null;
    }
  };

  const fetchStations = async () => {
    const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <tns:GetStations xmlns:tns="https://staging.abhibus.com/">
            <tns:username>${username}</tns:username>
            <tns:password>${password}</tns:password>
          </tns:GetStations>
        </soap:Body>
      </soap:Envelope>`;

    const url = "https://staging.abhibus.com/abhiWebServer";

    try {
      const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

      const response = await axios.post(url, soapRequest, {
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          Authorization: authHeader,
          SOAPAction: "https://staging.abhibus.com/GetStations",
        },
      });

      const result = await processSOAPResponse(response.data, "GetStations");

      if (result && result.stations) {
        setStations(result.stations);
        setShowSourceDropdown(true); 
      } else {
        setStations([]);
        setShowSourceDropdown(false);
      }
    } catch (err) {
      console.error("Error fetching stations:", err);
      Alert.alert("Error", "Failed to load stations.");
    }
  };

  const fetchDestinations = async () => {
    if (!selectedSourceId) {
      Alert.alert("Error", "Please select a source station first.");
      return;
    }

    const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <tns:GetDestinations xmlns:tns="https://staging.abhibus.com/">
            <tns:username>${username}</tns:username>
            <tns:password>${password}</tns:password>
            <tns:sourceStationId>${selectedSourceId}</tns:sourceStationId>
          </tns:GetDestinations>
        </soap:Body>
      </soap:Envelope>`;

    const url = "https://staging.abhibus.com/abhiWebServer";

    try {
      const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

      const response = await axios.post(url, soapRequest, {
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          Authorization: authHeader,
          SOAPAction: "https://staging.abhibus.com/GetDestinations",
        },
      });

      const result = await processSOAPResponse(response.data, "GetDestinations");

      if (result && result.stations) {
        setDestinationStations(result.stations);
        setShowDestinationDropdown(true);
      } else {
        setDestinationStations([]);
        setShowDestinationDropdown(false);
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
      Alert.alert("Error", "Failed to load destinations.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Display Current Date */}
      <Text style={styles.dateText}>Date: {date}</Text>

      <Text style={styles.label}>Source Station:</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Source"
        value={source}
        onFocus={fetchStations} 
        onChangeText={(text) => setSource(text)}
      />

      {showSourceDropdown && stations.length > 0 && (
        <FlatList
          data={stations}
          keyExtractor={(item) => String(item.Station_ID)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setSource(item.Station_Name);
                setSelectedSourceId(item.Station_ID);
                setShowSourceDropdown(false);
              }}
            >
              <Text>{item.Station_Name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={styles.label}>Destination Station:</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Destination"
        value={destination}
        onFocus={fetchDestinations}
        onChangeText={(text) => setDestination(text)}
      />

      {showDestinationDropdown && destinationStations.length > 0 && (
        <FlatList
          data={destinationStations}
          keyExtractor={(item) => String(item.Station_ID)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setDestination(item.Station_Name);
                setShowDestinationDropdown(false);
              }}
            >
              <Text>{item.Station_Name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Button title="Go to Ticket Page" onPress={() => navigation.navigate("Ticket")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e5fff1",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
});

export default Home;

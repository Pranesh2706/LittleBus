import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
  ImageBackground,
} from 'react-native';
import axios from 'axios';
import { parseString } from 'react-native-xml2js';
import BlueRect from "../LittleBus/Svg/BlueRect";
import WhiteRect from "../LittleBus/Svg/WhiteRect";
import LowPrice from "../LittleBus/Svg/LowPrice";
import MiddleWhiteRect from "../LittleBus/Svg/MiddleWhiteRect";
import BrownBus from "../LittleBus/Svg/BrownBus";
import BrownRect from "../LittleBus/Svg/BrownRect";
import BrownRightArrow from "../LittleBus/Svg/BrownRightArrow";
import BrownLeftArrow from "../LittleBus/Svg/BrownLeftArrow";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RedSemiSleeper from '../LittleBus/Svg/RedSemiSleeper';




const { width, height } = Dimensions.get('window');

const Ticket = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [busData, setBusData] = useState(null);
  const [error, setError] = useState(null);

  const fetchBusData = async () => {
    console.log("Fetching bus data...");
    setLoading(true);
    setError(null);

    const url = 'https://staging.abhibus.com/abhiWebServer';

    const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <tns:GetAvailableServices xmlns:tns="https://staging.abhibus.com/">
          <tns:username>demo@test</tns:username>
          <tns:password>demo@abhibus</tns:password>
          <tns:sourceStationId>3</tns:sourceStationId>
          <tns:destinationStationId>5</tns:destinationStationId>
          <tns:journeyDate>2025-02-18</tns:journeyDate>
        </tns:GetAvailableServices>
      </soap:Body>
    </soap:Envelope>`;

    try {
      const response = await axios.post(url, soapRequest, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'https://staging.abhibus.com/GetAvailableServices',
        },
      });

      parseString(response.data, { explicitArray: false }, (err, result) => {
        if (err) {
          setError('Failed to parse response.');
          setLoading(false);
          return;
        }

        const envelope = result?.["soap:Envelope"] || result?.["SOAP-ENV:Envelope"];
        const body = envelope?.["soap:Body"] || envelope?.["SOAP-ENV:Body"];
        const responseData = body?.["ns1:GetAvailableServicesResponse"]?.["ns1:GetAvailableServicesResult"];

        if (responseData) {
          try {
            const jsonData = JSON.parse(responseData);
            setBusData(jsonData);
          } catch (jsonError) {
            setError('Invalid data format received.');
          }
        } else {
          setError('No bus services found.');
        }

        setLoading(false);
      });
    } catch (error) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log(busData);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerText}>Bus Details</Text>
      </View>

      {/* Advertisement Section */}
      <View style={styles.advertisementSection}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../LittleBus/assets/hnm.gif')}
            style={[styles.dressImage, { width: width - 20 }]}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Scrollable Bus Data Section */}
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { width: '100%' }]} // Ensure ScrollView takes full width
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : busData && busData.services && Array.isArray(busData.services) ? (
          busData.services.map((item, index) => {
            const yellowBusTypes = [
              "MERCEDES BENZ AC Multi Axle Semi Sleeper",
              "VOLVO AC Multi Axle Sleeper",
              "VOLVO AC Semi Sleeper",
              "VOLVO AC Multi Axle Semi Sleeper",
            ];
            const isYellowCard = yellowBusTypes.includes(item.Bus_Type_Name);
            const uniqueKey = `bus-${item.operatorId || index}`;

            return (
              <TouchableOpacity
                key={uniqueKey}
                onPress={() => alert(`Selected Bus: ${item.Traveler_Agent_Name}`)}
              >
                {isYellowCard ? (
                  <View >


                    <View style={[styles.busCard, styles.fullyellow, { width: '100%' }]}>
                      {/* <Text style={styles.YellowboldText}>Operator ID: {item.operatorId}</Text> */}








                    </View>
                    <Text style={styles.LuxuryTravelAgentName}>{item.Traveler_Agent_Name}</Text>
                    <LowPrice style={styles.LowPrice} />
                    <WhiteRect style={styles.WhiteRect} />
                    <MiddleWhiteRect style={styles.MiddleWhiteRect} />
                    <BrownBus style={styles.BrownBus} />
                    <BrownRect style={styles.BrownRect} />
                    <Text style={styles.Fare}>₹ {item.Fare}</Text>
                    <Text style={styles.BusTypeboldText}>{item.Bus_Type_Name}</Text>
                    <BrownRightArrow style={styles.BrownRightArrow} />
                    <Text style={styles.LuxuryDuration}>{item.TravelTime} hrs</Text>
                    <BrownLeftArrow style={styles.BrownLeftArrow} />
                    <Icon name="target" size={20} color="#393939" style={styles.LuxuryTargetIcon} />
                    <Text style={styles.Luxurystart_time}>{item.Start_time}</Text>
                    <Text style={styles.Luxuryend_time}> {item.Arr_Time}</Text>
                    <View style={styles.LuxuryTotalSeats}>
                      <RedSemiSleeper />
                      <Text style={styles.LuxuryAvailableSeats}>{item.available_seats} Window Seats</Text>
                    </View>

                    <ImageBackground
                      source={require('../LittleBus/assets/arrow.gif')}
                      style={[styles.LuxuryRightArrowTwo, { transform: [{ rotate: '-90deg' }] }]}
                      resizeMode="contain"
                    ></ImageBackground>
                    <Text style={styles.AvailableSeats}>Available Seats{item.available_seats}</Text>




                    <View style={styles.YellowBackground}>
                      <ImageBackground
                        source={require('../LittleBus/assets/cc.png')} // Background image
                        style={[styles.imageBackground, { width: '100%' }]} // Full width for the image
                        imageStyle={{ borderRadius: 8 }} // Smooth corners
                        resizeMode="cover" // Ensure the image covers the entire background
                      ></ImageBackground>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.busCard, styles.whiteCard, { width: '100%' }]}>
                    <BlueRect style={styles.BlueRect} />
                    <Text style={styles.boldText}>Operator ID: {item.operatorId}</Text>
                    <Text style={styles.RegularTravelerAgentName}>{item.Traveler_Agent_Name}</Text>
                    <Text>Fare: ₹{item.Fare}</Text>
                    <Text>Duration: {item.TravelTime} hrs</Text>
                    <Text>Start Time: {item.Start_time}</Text>
                    <Text>Arrival Time: {item.Arr_Time}</Text>
                    <Text style={styles.boldText}>Bus Type: {item.Bus_Type_Name}</Text>
                    <LowPrice style={styles.RegularLowPrice} />
                    <View style={styles.TotalSeats}>
                      <RedSemiSleeper />
                      <Text style={styles.AvailableSeats}>{item.available_seats} Window Seats</Text>
                    </View>



                  </View>

                )}

              </TouchableOpacity>
            );
          })
        ) : (
          <Text>No bus data available.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.5,
    backgroundColor: '#e5fff1',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Luxurystart_time: {
    position: "absolute",
    left: 5,
    top: 60,
    fontWeight: "700",
    color: "#393939",
    fontSize: 16,
    zIndex: 3,
  },
  start_time: {
    position: "absolute",
    left: 30,
    top: 50,
  },
  Luxuryend_time: {
    position: "absolute",
    left: 210,
    top: 60,
    fontWeight: "700",
    color: "#393939",
    fontSize: 16,
    zIndex: 3,
  },
  end_time: {
    position: "absolute",
    left: 195,
    top: 50
  },
  AvailableSeats: {
    position: "absolute",
    fontSize: 16,
    zIndex: 5,
    left: 100,
  },
  headerSection: {
    height: height * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F487C',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 50,
    backgroundColor: "#e5fff1",
    marginTop: 20,
  },
  imageBackground: {
    width: '90%',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    height: "92%",
    zIndex: 1,
    position: "absolute",
    top: -5,
  },
  busCard: {
    marginBottom: 30,
    padding: 20,
    borderWidth: 1,
    borderRadius: 8,
    width: '90%',
    height: 170,
    alignSelf: 'center',
    elevation: 4,
    justifyContent: 'flex-start',

  },
  fullyellow: {
    borderColor: '#ffdddf',
    backgroundColor: '#ffdb58',
    border: "1px solid black",
    position: "relative",
    left: 0,

  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 1,
    position: "relative",
  },
  YellowboldText: {
    fontSize: 16,
    fontWeight: 'bold',
    position: "absolute",
    zIndex: 2,
  },
  BusTypeboldText: {
    fontSize: 12,
    fontWeight: "400",
    position: "absolute",
    top: 23,
    left: 5,
  },
  Rating: {
    marginTop: -180,
    position: "absolute",
  },
  WholeYellow: {
    position: "relative",
    marginBottom: 20,
  },
  YellowBackground: {
    position: "absolute",
    height: "100%",
    width: "100%",
    zIndex: 1,
  },
  WhiteRect: {
    top: -15,
    position: "absolute",
    zIndex: 100,
  },
  LowPrice: {
    position: "absolute",
    top: 80,
    zIndex: 2,
  },
  BlueRect: {
    marginTop: -40,
    marginLeft: -22,
    position: "absolute",
  },
  LuxuryTravelAgentName: {
    top: -4,
    position: "absolute",
    zIndex: 103,
    marginLeft: 10,
    color: "#393939",
    fontWeight: "700",
  },
  MiddleWhiteRect: {
    position: "absolute",
    top: 80,
    zIndex: 3,
    marginLeft: 50,
    height: 90,
    width: "90%",
  },
  RegularLowPrice: {
    position: "absolute",
  },
  RegularTravelerAgentName: {
    position: "absolute",
    marginTop: -35,
    color: "white",
    fontWeight: "700",
  },
  BrownBus: {
    position: "absolute",
    zIndex: 3,
    top: 40,
    left: 110,
    width: 70,
    height: 70,
  },
  LuxuryDuration: {
    position: "absolute",
    top: 60,
    left: 115,
    zIndex: 4,
    color: "white",
    fontSize: 11,

  },
  advertisementSection: {
    marginTop: 10,
    backgroundColor: "#e5fff1",

  },
  dressImage: {
    marginLeft: 10,
    // backgroundColor:"#e5fff1",
    borderRadius: 10,
  },
  imageContainer: {
    // backgroundColor:"#e5fff1",
  },
  BrownRect: {
    top: 73,
    position: "absolute",
    zIndex: 4,
    left: 270,
    height: 105,
    width: 160,
  },
  Fare: {
    position: "absolute",
    top: 105,
    left: 300,
    zIndex: 5,
    color: "white",
    fontSize: 25,
    fontWeight: "600",
  },
  BrownRightArrow: {
    position: "absolute",
    left: 180,
    top: 70,
    zIndex: 3,
  },
  BrownLeftArrow: {
    position: "absolute",
    marginTop: 70,
    zIndex: 3,
    marginLeft: 77,
  },
  LuxuryTargetIcon: {
    position: "absolute",
    left: 65,
    zIndex: 3,
    top: 147,
  },
  LuxuryRightArrowTwo: {
    position: "absolute",
    zIndex: 4,
    height: 70,
    width: 150,
    top: 90,
    left: 320,

  },
  Slow: {},
  TotalSeats: {
    flexDirection: "row", // Ensures the icon and text are aligned horizontally
    alignItems: "center",
    backgroundColor: '#FFC1C1',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    Left: 265,
    marginTop: 35,
    position: "absolute",
  },
  
  AvailableSeats: {
    color: '#C62B2B',  // Text color matches the icon
    fontWeight: '700',
    fontSize: 11,
    marginLeft: 5,  // Adds slight spacing between icon and text
  },

LuxuryTotalSeats:{
  flexDirection: "row", // Ensures the icon and text are aligned horizontally
  alignItems: "center",
  backgroundColor: '#FFC1C1',
  borderRadius: 15,
  paddingHorizontal: 8,
  paddingVertical: 5,
  alignSelf: 'flex-start',
  marginLeft: 270,
  marginTop: 35,
  position: "absolute",
},  
LuxuryAvailableSeats:{
  color: '#C62B2B',  // Text color matches the icon
  fontWeight: '700',
  fontSize: 11,
  marginLeft: 5,  
},





});

export default Ticket;

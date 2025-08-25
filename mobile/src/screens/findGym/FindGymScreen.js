import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5175';
const { width, height } = Dimensions.get('window');

const provinceCenters = {
  "Alberta": [52.4333, -115.5765],
  "British Columbia": [51.7267, -125.6476],
  "Manitoba": [52.0609, -97.8139],
  "New Brunswick": [45.5653, -66.4619],
  "Newfoundland and Labrador": [50.5, -57.6604],
  "Northwest Territories": [63.8255, -122.8457],
  "Nova Scotia": [44.6820, -63.7443],
  "Nunavut": [70.2998, -83.1076], 
  "Ontario": [46.5, -85.3232],
  "Prince Edward Island": [46.2, -63.2568],
  "Quebec": [51, -73.5491],
  "Saskatchewan": [52.5399, -106.4509],
  "Yukon": [63.2823, -135.0000]
};

const FindGymScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("Nova Scotia");
  const [activeGym, setActiveGym] = useState(null);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchGymsForProvince(filter);
  }, [filter]);

  useEffect(() => {
    filterGyms();
  }, [searchQuery, gyms]);

  const fetchGymsForProvince = async (province) => {
    try {
      setIsLoading(true);
      
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/api/getGymsByProvince/${encodeURIComponent(province)}`,
        { headers }
      );

      const gymsFromApi = Array.isArray(response.data) ? response.data : response.data?.gyms || [];
      
      const normalizedGyms = gymsFromApi.map(g => ({
        id: Number.isNaN(Number(g.id)) ? g.id : Number(g.id),
        name: g.name,
        province: province,
        position: g.position,
        tags: g.tags || [],
        rating: Number(g.rating ?? g.avg_rating ?? 0),
        ratingCount: Number(g.rating_count ?? g.ratingCount ?? 0),
        link: g.link,
        location: g.location,
        gym_hours: g.gym_hours
      }));

      setGyms(normalizedGyms);
    } catch (error) {
      console.error('Error fetching gyms:', error);
      Alert.alert('Error', 'Failed to load gyms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterGyms = () => {
    if (!searchQuery.trim()) {
      setFilteredGyms(gyms);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = gyms.filter(gym => 
      gym.name.toLowerCase().includes(query) ||
      gym.location?.toLowerCase().includes(query) ||
      gym.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    setFilteredGyms(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGymsForProvince(filter);
    setRefreshing(false);
  };

  const handleGymPress = (gym) => {
    navigation.navigate('GymDetails', { gymId: gym.name || gym.id, gym });
  };

  const handleProvinceChange = (province) => {
    setFilter(province);
    setShowFilters(false);
  };

  const renderGymCard = (gym) => (
    <TouchableOpacity 
      key={gym.id}
      style={styles.gymCard}
      onPress={() => handleGymPress(gym)}
    >
      <View style={styles.gymCardHeader}>
        <Text style={styles.gymName}>{gym.name}</Text>
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={16} color="#ff6b00" />
          <Text style={styles.rating}>
            {gym.rating > 0 ? gym.rating.toFixed(1) : 'N/A'}
          </Text>
          <Text style={styles.ratingCount}>
            ({gym.ratingCount})
          </Text>
        </View>
      </View>
      
      {gym.location && (
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={14} color="#666" />
          <Text style={styles.location}>{gym.location}</Text>
        </View>
      )}
      
      {gym.tags && gym.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {gym.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {gym.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{gym.tags.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const provinces = Object.keys(provinceCenters);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Gyms</Text>
        <TouchableOpacity
          style={styles.addGymButton}
          onPress={() => navigation.navigate('AddGym')}
        >
          <MaterialIcons name="add" size={24} color="#ff6b00" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search gyms, locations, or amenities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialIcons name="filter-list" size={20} color="#ff6b00" />
          <Text style={styles.filterButtonText}>{filter}</Text>
        </TouchableOpacity>
      </View>

      {/* Province Filter Dropdown */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView style={styles.provincesList} showsVerticalScrollIndicator={false}>
            {provinces.map((province) => (
              <TouchableOpacity
                key={province}
                style={[
                  styles.provinceItem,
                  filter === province && styles.selectedProvinceItem
                ]}
                onPress={() => handleProvinceChange(province)}
              >
                <Text style={[
                  styles.provinceText,
                  filter === province && styles.selectedProvinceText
                ]}>
                  {province}
                </Text>
                {filter === province && (
                  <MaterialIcons name="check" size={20} color="#ff6b00" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {isLoading ? 'Loading...' : `${filteredGyms.length} gyms in ${filter}`}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('GymMap', { gyms: filteredGyms, province: filter })}>
          <MaterialIcons name="map" size={24} color="#ff6b00" />
        </TouchableOpacity>
      </View>

      {/* Gyms List */}
      <ScrollView
        style={styles.gymsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ff6b00']}
            tintColor="#ff6b00"
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading gyms...</Text>
          </View>
        ) : filteredGyms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No gyms found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or selecting a different province
            </Text>
          </View>
        ) : (
          filteredGyms.map(renderGymCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  addGymButton: {
    padding: 8,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff6b00',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#ff6b00',
    fontWeight: '500',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    maxHeight: 200,
  },
  provincesList: {
    paddingHorizontal: 20,
  },
  provinceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedProvinceItem: {
    backgroundColor: '#fff5f0',
  },
  provinceText: {
    fontSize: 16,
    color: '#222',
  },
  selectedProvinceText: {
    color: '#ff6b00',
    fontWeight: '500',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  resultsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  gymsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gymCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gymCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gymName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  ratingCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#fff5f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#ff6b00',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default FindGymScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNearbyGyms();
  }, []);

  const fetchNearbyGyms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/gyms/nearby');
      setGyms(response.data.gyms || []);
    } catch (error) {
      console.error('Error fetching gyms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/gyms/search?q=${searchQuery}`);
      setGyms(response.data.gyms || []);
    } catch (error) {
      console.error('Error searching gyms:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGymCard = (gym) => (
    <TouchableOpacity key={gym.id} style={styles.gymCard}>
      <Image
        source={{ uri: gym.image || 'https://via.placeholder.com/300x150' }}
        style={styles.gymImage}
      />
      <View style={styles.gymInfo}>
        <Text style={styles.gymName}>{gym.name}</Text>
        <Text style={styles.gymAddress}>{gym.address}</Text>
        <View style={styles.gymRating}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {gym.rating || 0} ({gym.review_count || 0} reviews)
          </Text>
        </View>
        <Text style={styles.gymDistance}>{gym.distance || 'N/A'} km away</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Gyms</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search gyms near you..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.quickFilters}>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Nearby</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Top Rated</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>24/7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterChipText}>Budget</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading gyms...</Text>
          </View>
        ) : gyms.length > 0 ? (
          <View style={styles.gymsList}>
            {gyms.map(renderGymCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No gyms found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or location
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterChip: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterChipText: {
    fontSize: 14,
    color: '#333',
  },
  gymsList: {
    paddingHorizontal: 20,
  },
  gymCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  gymImage: {
    width: '100%',
    height: 150,
  },
  gymInfo: {
    padding: 15,
  },
  gymName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  gymAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  gymRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  gymDistance: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ExploreScreen;

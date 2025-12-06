import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { mockGeographyData } from '../../data/mockGeoData';

@Component({
  selector: 'app-geography',
  templateUrl: './geography.component.html',
  styleUrls: ['./geography.component.scss']
})
export class GeographyComponent implements OnInit, AfterViewInit {
  @ViewChild('worldMap', { static: false }) worldMapRef!: ElementRef;
  
  geographyData: any[] = [];
  mapData: any = null;
  isLoading = true;
  displayedColumns: string[] = ['country', 'value'];

  constructor() {}

  ngOnInit() {
    this.loadGeographyData();
    this.loadWorldMap();
  }

  loadGeographyData() {
    // Use mock data
    this.geographyData = mockGeographyData;
  }

  async loadWorldMap() {
    try {
      // Load world map GeoJSON from a reliable source
      const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
      if (!response.ok) {
        throw new Error('Failed to load map data');
      }
      this.mapData = await response.json();
      this.isLoading = false;
      
      // Render map after a short delay to ensure view is ready
      setTimeout(() => {
        if (this.worldMapRef) {
          this.renderMap();
        }
      }, 200);
    } catch (error) {
      console.error('Error loading world map:', error);
      this.isLoading = false;
      // Try alternative source
      this.loadAlternativeMap();
    }
  }

  async loadAlternativeMap() {
    try {
      const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      this.mapData = await response.json();
      this.isLoading = false;
      setTimeout(() => {
        if (this.worldMapRef) {
          this.renderMap();
        }
      }, 200);
    } catch (error) {
      console.error('Error loading alternative map:', error);
    }
  }

  ngAfterViewInit() {
    if (this.mapData && this.worldMapRef) {
      setTimeout(() => this.renderMap(), 100);
    }
  }

  renderMap() {
    if (!this.worldMapRef || !this.mapData) {
      console.warn('Cannot render map: missing ref or data');
      return;
    }

    const svg = d3.select(this.worldMapRef.nativeElement);
    svg.selectAll('*').remove();

    const width = 1000;
    const height = 500;
    const projection = d3Geo.geoMercator()
      .scale(150)
      .translate([width / 2, height / 2]);

    const path = d3Geo.geoPath().projection(projection);

    const g = svg.append('g').attr('class', 'countries');

    g.selectAll('path')
      .data(this.mapData.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', (d: any) => {
        const iso = d.properties?.ISO_A2 || d.properties?.ISO_A3 || d.properties?.ADM0_A3 || d.id;
        return this.getCountryColor(iso);
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .attr('class', 'country-path')
      .on('mouseover', (event: any, d: any) => {
        d3.select(event.currentTarget)
          .attr('stroke-width', 2)
          .attr('stroke', '#1976d2')
          .attr('opacity', 0.8);
      })
      .on('mouseout', (event: any, d: any) => {
        d3.select(event.currentTarget)
          .attr('stroke-width', 0.5)
          .attr('stroke', '#ffffff')
          .attr('opacity', 1);
      })
      .append('title')
      .text((d: any) => {
        const iso = d.properties?.ISO_A2 || d.properties?.ISO_A3 || d.properties?.ADM0_A3 || d.id;
        const name = d.properties?.NAME || d.properties?.name || d.properties?.ADMIN || 'Unknown';
        const value = this.getCountryValue(iso);
        return `${name}: ${value.toLocaleString()}`;
      });
  }

  getCountryValue(countryId: string): number {
    const country = this.geographyData.find(d => d.id === countryId);
    return country ? country.value : 0;
  }

  getCountryColor(countryId: string): string {
    const value = this.getCountryValue(countryId);
    if (value === 0) return '#e0e0e0';
    if (value < 200000) return '#c8e6c9';
    if (value < 400000) return '#81c784';
    if (value < 600000) return '#4caf50';
    if (value < 800000) return '#388e3c';
    if (value < 1000000) return '#2e7d32';
    return '#1b5e20';
  }

  getCountryName(countryId: string): string {
    const countryNames: any = {
      'USA': 'United States',
      'GBR': 'United Kingdom',
      'CAN': 'Canada',
      'AUS': 'Australia',
      'DEU': 'Germany',
      'FRA': 'France',
      'IND': 'India',
      'CHN': 'China',
      'JPN': 'Japan',
      'BRA': 'Brazil',
      'MEX': 'Mexico',
      'RUS': 'Russia',
      'ZAF': 'South Africa',
      'KOR': 'South Korea',
      'ITA': 'Italy',
      'ESP': 'Spain',
      'NLD': 'Netherlands',
      'SWE': 'Sweden',
      'NOR': 'Norway',
      'DNK': 'Denmark'
    };
    return countryNames[countryId] || countryId;
  }
}

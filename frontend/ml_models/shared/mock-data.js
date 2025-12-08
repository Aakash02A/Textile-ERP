/**
 * Mock Data Generator for Development
 * Replace with real API calls when backend is ready
 */

const MockData = {
    // ========== Demand Forecasting Mock Data ==========
    demandForecasting: {
        skus: [
            { id: 'SKU001', name: 'Cotton Fabric Type A', category: 'Fabric' },
            { id: 'SKU002', name: 'Polyester Blend B', category: 'Fabric' },
            { id: 'SKU003', name: 'Silk Thread', category: 'Thread' },
            { id: 'SKU004', name: 'Dye Chemical X', category: 'Chemical' },
            { id: 'SKU005', name: 'Elastic Band', category: 'Accessory' }
        ],

        forecast: {
            dates: [],
            actual: [],
            predicted: [],
            confidence_upper: [],
            confidence_lower: []
        },

        metrics: {
            mae: 2.5,
            rmse: 3.2,
            mape: 4.8,
            r_squared: 0.92,
            accuracy: 94.2
        }
    },

    // ========== Inventory Optimization Mock Data ==========
    inventoryOptimization: {
        recommendations: [
            {
                sku_id: 'SKU001',
                current_stock: 500,
                recommended_stock: 750,
                reorder_point: 200,
                safety_stock: 150,
                potential_savings: 12500
            },
            {
                sku_id: 'SKU002',
                current_stock: 300,
                recommended_stock: 400,
                reorder_point: 100,
                safety_stock: 80,
                potential_savings: 8200
            }
        ],

        abcAnalysis: {
            a_items: 15,
            b_items: 35,
            c_items: 50,
            a_value_percentage: 80,
            b_value_percentage: 15,
            c_value_percentage: 5
        },

        costSavings: {
            current_inventory_cost: 50000,
            optimized_inventory_cost: 35000,
            potential_savings: 15000,
            savings_percentage: 30
        }
    },

    // ========== Supplier Risk Scoring Mock Data ==========
    supplierRiskScoring: {
        suppliers: [
            {
                id: 'SUP001',
                name: 'Global Textiles Co',
                risk_score: 35,
                delivery_risk: 30,
                quality_risk: 40,
                price_risk: 35,
                status: 'stable',
                performance_trend: 'up'
            },
            {
                id: 'SUP002',
                name: 'Premium Fabrics Ltd',
                risk_score: 65,
                delivery_risk: 70,
                quality_risk: 60,
                price_risk: 65,
                status: 'warning',
                performance_trend: 'down'
            },
            {
                id: 'SUP003',
                name: 'Eco Materials Inc',
                risk_score: 25,
                delivery_risk: 20,
                quality_risk: 30,
                price_risk: 25,
                status: 'low_risk',
                performance_trend: 'up'
            }
        ]
    },

    // ========== Defect Detection Mock Data ==========
    defectDetection: {
        defect_types: ['Stain', 'Tear', 'Misalignment', 'Color Variation', 'Weaving Error'],
        trends: {
            dates: [],
            defect_count: [],
            defect_rate: []
        },
        line_defects: {
            line_1: { defect_count: 5, defect_rate: 2.1 },
            line_2: { defect_count: 3, defect_rate: 1.5 },
            line_3: { defect_count: 8, defect_rate: 3.2 }
        }
    },

    // ========== Quality Prediction Mock Data ==========
    qualityPrediction: {
        batch_results: {
            batch_id: 'BATCH001',
            quality_score: 92.5,
            prediction_confidence: 0.87,
            status: 'pass',
            confidence_lower: 85.2,
            confidence_upper: 99.8
        },

        feature_importance: [
            { feature: 'Temperature', importance: 0.25 },
            { feature: 'Humidity', importance: 0.20 },
            { feature: 'Machine Speed', importance: 0.18 },
            { feature: 'Material Quality', importance: 0.15 },
            { feature: 'Operator Experience', importance: 0.12 },
            { feature: 'Calibration Status', importance: 0.10 }
        ]
    }
};

/**
 * Utility function to generate time series data
 */
function generateTimeSeriesData(days = 30) {
    const data = [];
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            value: Math.floor(Math.random() * 100) + 50
        });
    }
    
    return data;
}

/**
 * Generate mock forecast data
 */
function generateMockForecast(days = 30) {
    const dates = [];
    const actual = [];
    const predicted = [];
    const confidence_upper = [];
    const confidence_lower = [];

    const today = new Date();
    
    for (let i = -days; i <= days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);

        const baseValue = 500 + Math.sin(i / 10) * 200;
        const noise = Math.random() * 50 - 25;
        
        if (i <= 0) {
            // Historical data
            actual.push(baseValue + noise);
            predicted.push(baseValue + noise * 0.5);
        } else {
            // Future forecast
            actual.push(null);
            predicted.push(baseValue + noise * 0.3);
        }

        confidence_upper.push(baseValue + 100);
        confidence_lower.push(baseValue - 100);
    }

    return { dates, actual, predicted, confidence_upper, confidence_lower };
}

// Export for use
window.MockData = MockData;
window.generateTimeSeriesData = generateTimeSeriesData;
window.generateMockForecast = generateMockForecast;

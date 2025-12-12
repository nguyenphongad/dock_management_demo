import React, { useEffect, useState, useRef } from 'react';
import { MdExitToApp, MdScale } from 'react-icons/md';
import { FiTruck } from 'react-icons/fi';
import {
    getVehiclesFromStorage,
    categorizeVehiclesByTime,
    extractDockCode,
    calculateAnimationDuration
} from '../../utils/vehicleStorageManager';
import TruckAnimation from '../TruckAnimation/TruckAnimation';
import DockItem from '../DockItem/DockItem';
import DockingTruck from '../DockingTruck/DockingTruck';
import './DockMapNKD.scss';

const DockMapNKD = ({ warehouse, kpis }) => {
    const [activeAnimations, setActiveAnimations] = useState([]);
    const [activeDocks, setActiveDocks] = useState(new Set());
    const [dockingTrucks, setDockingTrucks] = useState(new Map());
    const [occupiedSlots, setOccupiedSlots] = useState(new Map());
    const [realTimeKpis, setRealTimeKpis] = useState({
        currentlyLoading: 0,
        waiting: 0,
        completedToday: 0
    });
    const processedVehicleIds = useRef(new Set());

    // Định nghĩa cấu trúc dock NKD
    const nkdDocks = {
        finishedGoods: {
            rightColumn: ['A1.1', 'A1.2', 'A2.1', 'A2.2'], // Cột bên phải
            bottomRow: ['A3', 'A4', 'A5', 'A6'] // Hàng dưới
        },
        workshop2: ['WS2'],
        parkingLot: ['C1', 'C2', 'C3']
    };

    useEffect(() => {
        const updateAnimations = () => {
            const storedVehicles = getVehiclesFromStorage();
            if (storedVehicles.length === 0) return;

            const categorized = categorizeVehiclesByTime(storedVehicles);

            // Xử lý xe đang loading
            const dockingMap = new Map();
            const slotMap = new Map();

            categorized.loading.forEach(vehicle => {
                const dockCode = extractDockCode(vehicle.DockName);
                if (dockCode) {
                    let slotPosition = 1;
                    const existingSlots = Array.from(slotMap.entries())
                        .filter(([key]) => key.startsWith(dockCode))
                        .map(([, slot]) => slot);

                    if (existingSlots.length > 0) {
                        slotPosition = Math.max(...existingSlots) + 1;
                    }

                    if (slotPosition <= 2) {
                        const key = `${dockCode}_slot${slotPosition}`;
                        dockingMap.set(key, {
                            plateNumber: vehicle.RegNo,
                            dockCode: dockCode,
                            dockName: vehicle.DockName,
                            slotPosition: slotPosition,
                            vehicleId: vehicle.ID
                        });
                        slotMap.set(key, slotPosition);
                    }
                }
            });

            setDockingTrucks(dockingMap);
            setOccupiedSlots(slotMap);

            // Xe đang vào
            const enteringAnimations = categorized.entering
                .filter(vehicle => {
                    const alreadyProcessed = processedVehicleIds.current.has(`entering_${vehicle.ID}`);
                    const alreadyDocked = Array.from(dockingTrucks.values())
                        .some(t => t.vehicleId === vehicle.ID);
                    return !alreadyProcessed && !alreadyDocked;
                })
                .map(vehicle => {
                    const dockCode = extractDockCode(vehicle.DockName);
                    const animationInfo = calculateAnimationDuration(vehicle);

                    const existingSlots = Array.from(slotMap.entries())
                        .filter(([key]) => key.startsWith(dockCode))
                        .map(([, slot]) => slot);
                    const slotPosition = existingSlots.length > 0 ? Math.max(...existingSlots) + 1 : 1;

                    processedVehicleIds.current.add(`entering_${vehicle.ID}`);

                    return {
                        id: `entering_${vehicle.ID}`,
                        vehicleId: vehicle.ID,
                        plateNumber: vehicle.RegNo,
                        fromGate: 'GATE_NKD', // Cổng duy nhất
                        toDock: dockCode,
                        toGate: 'GATE_NKD',
                        dockName: vehicle.DockName,
                        phase: 'entering',
                        duration: animationInfo?.duration || 5000,
                        slotPosition: Math.min(slotPosition, 2)
                    };
                });

            // Xe đang ra
            const exitingAnimations = categorized.exiting
                .filter(vehicle => !processedVehicleIds.current.has(`exiting_${vehicle.ID}`))
                .map(vehicle => {
                    const dockCode = extractDockCode(vehicle.DockName);
                    const animationInfo = calculateAnimationDuration(vehicle);

                    processedVehicleIds.current.add(`exiting_${vehicle.ID}`);

                    return {
                        id: `exiting_${vehicle.ID}`,
                        vehicleId: vehicle.ID,
                        plateNumber: vehicle.RegNo,
                        fromGate: 'GATE_NKD',
                        toDock: dockCode,
                        toGate: 'GATE_NKD',
                        dockName: vehicle.DockName,
                        phase: 'exiting',
                        duration: animationInfo?.duration || 5000,
                        slotPosition: 1
                    };
                });

            setActiveAnimations(prev => {
                const newAnimations = [...enteringAnimations, ...exitingAnimations];
                const existingIds = new Set(prev.map(a => a.id));
                const filtered = newAnimations.filter(a => !existingIds.has(a.id));
                return filtered.length > 0 ? [...prev, ...filtered] : prev;
            });

            const loadingDockCodes = new Set(
                categorized.loading.map(v => extractDockCode(v.DockName)).filter(Boolean)
            );
            setActiveDocks(loadingDockCodes);

            categorized.completed.forEach(v => {
                processedVehicleIds.current.delete(`entering_${v.ID}`);
                processedVehicleIds.current.delete(`exiting_${v.ID}`);
            });
        };

        updateAnimations();
        const interval = setInterval(updateAnimations, 10000);
        return () => clearInterval(interval);
    }, [dockingTrucks]);

    // Tính KPIs
    useEffect(() => {
        const calculateKPIs = () => {
            const storedVehicles = getVehiclesFromStorage();
            if (storedVehicles.length === 0) return;

            const categorized = categorizeVehiclesByTime(storedVehicles);
            const currentlyLoading = categorized.loading.length;
            const waiting = categorized.waiting.length;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const completedToday = categorized.completed.filter(v => {
                if (!v.GateOut) return false;
                const gateOutDate = new Date(v.GateOut);
                return gateOutDate >= today;
            }).length;

            setRealTimeKpis({ currentlyLoading, waiting, completedToday });
        };

        calculateKPIs();
        const interval = setInterval(calculateKPIs, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleAnimationComplete = (animationId) => {
        setActiveAnimations(prev => prev.filter(a => {
            if (a.id === animationId && a.phase === 'exiting') {
                return false;
            }
            return true;
        }));
    };

    const handleDockArrival = (dockCode, slotPosition) => {
        console.log(`✅ Truck arrived at ${dockCode} slot ${slotPosition}`);
        setActiveDocks(prev => new Set([...prev, dockCode]));
    };

    const handleDockDeparture = (dockCode) => {
        console.log(`🚛 Truck departing from dock: ${dockCode}`);
        setActiveAnimations(prev => prev.filter(a =>
            !(a.toDock === dockCode && a.phase === 'entering')
        ));
        setTimeout(() => {
            setActiveDocks(prev => {
                const newSet = new Set(prev);
                newSet.delete(dockCode);
                return newSet;
            });
        }, 500);
    };

    const getVehiclesAtDock = (dockCode) => {
        const storedVehicles = getVehiclesFromStorage();
        const categorized = categorizeVehiclesByTime(storedVehicles);

        const vehiclesAtDock = categorized.loading
            .filter(v => {
                const vDockCode = extractDockCode(v.DockName);
                return vDockCode === dockCode;
            })
            .slice(0, 2)
            .map(v => ({
                plateNumber: v.RegNo,
                driverName: v.DriverName,
                gateInTime: v.GateIn,
                loadingStartTime: v.LoadingStart,
                utilizationStatus: 'normal'
            }));

        return vehiclesAtDock;
    };

    const miniKpis = [
        { title: 'Currently Loading', value: realTimeKpis.currentlyLoading, icon: '🚛', color: '#3498db' },
        { title: 'Waiting', value: realTimeKpis.waiting, icon: '⏳', color: '#f39c12' },
        { title: 'Completed Today', value: realTimeKpis.completedToday, icon: '✅', color: '#27ae60' }
    ];

    return (
        <div className="dock-map-nkd">
            {/* HEADER */}
            <div className="dock-map-nkd__header">
                <div className="header-left">
                    <h3 className="dock-map-nkd__title">Sơ đồ Dock - {warehouse}</h3>
                </div>
                <div className="header-center">
                    <div className="dock-map-nkd__kpis">
                        {miniKpis.map((kpi, index) => (
                            <div key={index} className="mini-kpi-card" style={{ borderLeftColor: kpi.color }}>
                                <div className="mini-kpi-card__icon">{kpi.icon}</div>
                                <div className="mini-kpi-card__content">
                                    <div className="mini-kpi-card__value">{kpi.value}</div>
                                    <div className="mini-kpi-card__title">{kpi.title}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="header-right">
                    <div className="dock-map-nkd__legend">
                        <div className="legend-item">
                            <span className="legend-dot legend-dot--empty"></span>
                            <span>Trống</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot legend-dot--loading"></span>
                            <span>Đang load</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAP CONTENT */}
            <div className="dock-map-nkd__content">
                {/* ANIMATIONS */}
                {activeAnimations.map(animation => (
                    <TruckAnimation
                        key={animation.id}
                        plateNumber={animation.plateNumber}
                        fromGate={animation.fromGate}
                        toDock={animation.toDock}
                        toGate={animation.toGate}
                        phase={animation.phase}
                        duration={animation.duration}
                        slotPosition={animation.slotPosition}
                        onDockArrival={handleDockArrival}
                        onDockDeparture={handleDockDeparture}
                        onAnimationComplete={() => handleAnimationComplete(animation.id)}
                    />
                ))}

                {/* DOCKING TRUCKS */}
                {Array.from(dockingTrucks.values()).map(truck => (
                    <DockingTruck
                        key={`docking_${truck.dockCode}_slot${truck.slotPosition}`}
                        plateNumber={truck.plateNumber}
                        dockCode={truck.dockCode}
                        slotPosition={truck.slotPosition}
                    />
                ))}

                {/* ===== ĐƯỜNG ĐI (ROADS) ===== */}
                <div className="road-gate-to-weight"></div>
                <div className="road-weight-to-finished"></div>
                <div className="road-finished-to-workshop"></div>
                <div className="road-finished-to-parking"></div>

                {/* LAYOUT */}
                <div className="nkd-layout">
                    {/* TOP ROW: Workshop 2 */}
                    <div className="nkd-layout__top">
                        <div className="workshop-area">
                            <div className="area-label">Work-Shop 2</div>
                            <div className="workshop-docks">
                                {nkdDocks.workshop2.map(dock => (
                                    <div key={dock} className={activeDocks.has(dock) ? 'dock-arrival-animation' : ''}>
                                        <DockItem
                                            dockCode={dock}
                                            vehicles={getVehiclesAtDock(dock)}
                                            orientation="horizontal"
                                            labelPosition="top"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE ROW: Finished Goods Warehouse + Weight Station */}
                    <div className="nkd-layout__middle">
                        {/* FINISHED GOODS WAREHOUSE */}
                        <div className="finished-goods-area">
                            <div className="area-label">Finished Good Warehouse</div>
                            <div className="finished-goods-content">
                                {/* Right Column: A1.1, A1.2, A2.1, A2.2 */}
                                <div className="finished-goods-right">
                                    {nkdDocks.finishedGoods.rightColumn.map(dock => (
                                        <div key={dock} className={activeDocks.has(dock) ? 'dock-arrival-animation' : ''}>
                                            <DockItem
                                                dockCode={dock}
                                                vehicles={getVehiclesAtDock(dock)}
                                                orientation="vertical"
                                                labelPosition="right"
                                            />
                                        </div>
                                    ))}
                                </div>
                                {/* Bottom Row: A3, A4, A5, A6 */}
                                <div className="finished-goods-bottom">
                                    {nkdDocks.finishedGoods.bottomRow.map(dock => (
                                        <div key={dock} className={activeDocks.has(dock) ? 'dock-arrival-animation' : ''}>
                                            <DockItem
                                                dockCode={dock}
                                                vehicles={getVehiclesAtDock(dock)}
                                                orientation="horizontal"
                                                labelPosition="bottom"
                                            />
                                        </div>
                                    ))}
                                </div>


                            </div>
                        </div>

                        {/* WEIGHT STATION */}
                        <div className="weight-station">
                            <div className="weight-station__icon">
                                <MdScale size={40} />
                            </div>
                            <div className="weight-station__label">Trạm Cân</div>
                        </div>
                    </div>

                    {/* BOTTOM ROW: Parking Lot + Gate */}
                    <div className="nkd-layout__bottom">
                        {/* PARKING LOT */}
                        <div className="parking-lot-area">
                            <div className="area-label">Parking Lot</div>
                            <div className="parking-lot-docks">
                                {nkdDocks.parkingLot.map(dock => (
                                    <div key={dock} className={activeDocks.has(dock) ? 'dock-arrival-animation' : ''}>
                                        <DockItem
                                            dockCode={dock}
                                            vehicles={getVehiclesAtDock(dock)}
                                            orientation="horizontal"
                                            labelPosition="bottom"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* GATE */}
                        <div className="nkd-gate">
                            <MdExitToApp size={24} />
                            <span>CỔNG</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DockMapNKD;

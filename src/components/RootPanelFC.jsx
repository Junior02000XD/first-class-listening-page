import { useState, useEffect } from "react";
import { Form, Button, Table, Card, Spinner, Row, Col, Badge, Alert } from "react-bootstrap";
import api from "../api/axios";

export function RootPanelFC() {
    // --- ESTADOS PARA GENERACIÓN DE CÓDIGOS ---
    const [cursos, setCursos] = useState([]);
    const [seleccion, setSeleccion] = useState({ cursoId: "", cantidad: 10 });
    const [codigos, setCodigos] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- ESTADOS PARA IMPORTACIÓN DE EXCEL ---
    const [file, setFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState({ text: "", type: "" });

    useEffect(() => {
        // Obtenemos los cursos para el selector
        api.get("/cursos").then(res => setCursos(res.data));
    }, []);

    // ---------------------------------------------------------
    // LÓGICA: GENERAR CÓDIGOS NUEVOS
    // ---------------------------------------------------------
    const generarCodigos = async () => {
        if (!seleccion.cursoId) return;
        setLoading(true);
        try {
            const res = await api.post(`/codigos/crear?cursoId=${seleccion.cursoId}&cantidad=${seleccion.cantidad}`);
            setCodigos(res.data);
        } catch { 
            alert("Error al conectar con la API de Railway"); 
        } finally { 
            setLoading(false); 
        }
    };

    const descargarCSV = () => {
        if (codigos.length === 0) return;
        const BOM = "\uFEFF";
        const contenido = "Indice;Codigo;Estado\n" + 
            codigos.map((c, i) => `${i + 1};${c};Disponible`).join("\n");

        const blob = new Blob([BOM + contenido], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        const fecha = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `Codigos_FirstClass_${fecha}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ---------------------------------------------------------
    // LÓGICA: IMPORTAR EXCEL (CÓDIGOS ANTIGUOS)
    // ---------------------------------------------------------
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setUploadMsg({ text: "", type: "" }); 

        if (selectedFile) {
            if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
                setUploadMsg({ text: "Por favor, selecciona un archivo válido (.xlsx)", type: "danger" });
                setFile(null);
                e.target.value = null; 
                return;
            }
            setFile(selectedFile);
        }
    };

    const importarExcel = async () => {
        if (!file) return;
        
        setUploadLoading(true);
        setUploadMsg({ text: "", type: "" });

        const formData = new FormData();
        formData.append("archivo", file); 

        try {
            const res = await api.post("/codigos/importar-excel", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            setUploadMsg({ text: res.data.mensaje, type: "success" });
            setFile(null); 
            document.getElementById("excel-upload-input").value = ""; 
        } catch (err) {
            setUploadMsg({ 
                text: err.response?.data?.mensaje || "Error interno al subir el archivo.", 
                type: "danger" 
            });
        } finally {
            setUploadLoading(false);
        }
    };

    // --- ESTILOS COMPARTIDOS ---
    const cardStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.25)', 
        backdropFilter: 'blur(12px)', 
        color: '#FFFFFF',
        borderRadius: '16px'
    };

    const inputStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        color: '#2E1572',
        border: 'none'
    };

    const btnPrimaryStyle = {
        backgroundColor: '#DEB831',
        borderColor: '#DEB831',
        color: '#2E1572',
        fontWeight: 'bold'
    };

    return (
        <Card className="p-4 shadow-lg border-0 h-100 mt-4" style={cardStyle}>
            {/* SECCIÓN 1: GENERADOR DE CÓDIGOS NUEVOS */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0" style={{ color: '#DEB831' }}>Generador Masivo de Códigos</h5>
                <Badge bg="danger" className="px-3 py-2 shadow-sm border border-light">Acceso Root</Badge>
            </div>

            <Form className="mb-4">
                <Row className="g-3">
                    <Col md={7}>
                        <Form.Group>
                            <Form.Label className="small fw-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>1. Curso a vincular</Form.Label>
                            <Form.Select 
                                className="py-2 shadow-sm"
                                style={inputStyle}
                                value={seleccion.cursoId}
                                onChange={e => setSeleccion({...seleccion, cursoId: e.target.value})}
                            >
                                <option value="">Selecciona el curso destino...</option>
                                {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={5}>
                        <Form.Group>
                            <Form.Label className="small fw-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>2. Cantidad</Form.Label>
                            <Form.Control 
                                type="number" 
                                min="1" 
                                max="500"
                                className="py-2 shadow-sm"
                                style={inputStyle}
                                value={seleccion.cantidad} 
                                onChange={e => setSeleccion({...seleccion, cantidad: e.target.value})} 
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Button 
                    className="mt-4 w-100 py-2 shadow-sm" 
                    style={btnPrimaryStyle}
                    onClick={generarCodigos} 
                    disabled={loading || !seleccion.cursoId}
                >
                    {loading ? <Spinner size="sm" className="me-2" /> : null}
                    {loading ? "Generando en Railway..." : "⚡ Generar y Guardar en BD"}
                </Button>
            </Form>

            {codigos.length > 0 && (
                <div className="mt-4 mb-5 animate__animated animate__fadeIn">
                    <div className="d-flex justify-content-between align-items-end mb-3">
                        <h6 className="fw-bold mb-0" style={{ color: 'rgba(255,255,255,0.8)' }}>Previsualización:</h6>
                        <Button variant="success" size="sm" onClick={descargarCSV} className="fw-bold shadow-sm px-3 border-0">
                            📥 Descargar .CSV para Excel
                        </Button>
                    </div>
                    
                    {/* Tabla rediseñada para modo oscuro */}
                    <div className="rounded overflow-hidden shadow-sm" style={{ maxHeight: "300px", overflowY: "auto", backgroundColor: 'rgba(0,0,0,0.15)' }}>
                        <Table variant="dark" hover responsive className="mb-0 small align-middle" style={{ backgroundColor: 'transparent' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                <tr>
                                    <th style={{ width: '60px', backgroundColor: '#1a0b40', color: '#DEB831' }} className="border-0 text-center">#</th>
                                    <th style={{ backgroundColor: '#1a0b40', color: '#DEB831' }} className="border-0">Código Generado</th>
                                    <th style={{ backgroundColor: '#1a0b40', color: '#DEB831' }} className="border-0 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {codigos.map((c, i) => (
                                    <tr key={i}>
                                        <td className="text-center border-dark" style={{ color: 'rgba(255,255,255,0.5)' }}>{i + 1}</td>
                                        <td className="border-dark"><code className="fw-bold" style={{ color: '#DEB831', fontSize: '1rem' }}>{c}</code></td>
                                        <td className="text-center border-dark"><Badge bg="success" className="text-white">Listo</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}

            <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} className="my-5" />

            {/* SECCIÓN 2: IMPORTADOR DE CÓDIGOS ANTIGUOS (MIGRACIÓN) */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0" style={{ color: '#DEB831' }}>Importar Códigos de Migración</h5>
                <Badge bg="warning" text="dark" className="px-3 py-2 shadow-sm">Solo formato .xlsx</Badge>
            </div>

            <Form>
                <Row className="g-3 align-items-end">
                    <Col md={9}>
                        <Form.Group>
                            <Form.Label className="small fw-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>Selecciona el archivo Excel</Form.Label>
                            <Form.Control 
                                type="file" 
                                accept=".xlsx" 
                                className="py-2 shadow-sm"
                                style={{ ...inputStyle, cursor: 'pointer' }}
                                onChange={handleFileChange}
                                id="excel-upload-input"
                                disabled={uploadLoading}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Button 
                            className="w-100 fw-bold py-2 shadow-sm" 
                            style={{ backgroundColor: '#2E1572', borderColor: '#DEB831', color: '#DEB831', borderWidth: '2px' }}
                            onClick={importarExcel}
                            disabled={!file || uploadLoading}
                        >
                            {uploadLoading ? <Spinner size="sm" className="me-2" /> : null}
                            {uploadLoading ? "Subiendo..." : "Subir Excel"}
                        </Button>
                    </Col>
                </Row>
                <Form.Text className="mt-3 d-block" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    El Excel debe tener la primera fila con los títulos: <strong className="text-white">Codigo</strong> y <strong className="text-white">CursoId</strong>.
                </Form.Text>

                {uploadMsg.text && (
                    <Alert variant={uploadMsg.type} className="mt-4 small py-2 border-0 shadow-sm text-center fw-bold">
                        {uploadMsg.text}
                    </Alert>
                )}
            </Form>
        </Card>
    );
}
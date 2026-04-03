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
        setUploadMsg({ text: "", type: "" }); // Limpiamos mensajes previos

        if (selectedFile) {
            // Validación rápida de extensión en el Frontend
            if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
                setUploadMsg({ text: "Por favor, selecciona un archivo válido (.xlsx)", type: "danger" });
                setFile(null);
                e.target.value = null; // Resetea el input
                return;
            }
            setFile(selectedFile);
        }
    };

    const importarExcel = async () => {
        if (!file) return;
        
        setUploadLoading(true);
        setUploadMsg({ text: "", type: "" });

        // FormData es obligatorio para enviar archivos
        const formData = new FormData();
        // IMPORTANTE: "archivo" debe llamarse igual que en el backend [HttpPost] IFormFile archivo
        formData.append("archivo", file); 

        try {
            const res = await api.post("/codigos/importar-excel", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    // Authorization ya debería ir implícito si configuras interceptores en api/axios.js
                },
            });
            
            setUploadMsg({ text: res.data.mensaje, type: "success" });
            setFile(null); // Limpiamos el archivo subido
            document.getElementById("excel-upload-input").value = ""; // Limpiamos visualmente el input
        } catch (err) {
            setUploadMsg({ 
                text: err.response?.data?.mensaje || "Error interno al subir el archivo.", 
                type: "danger" 
            });
        } finally {
            setUploadLoading(false);
        }
    };

    return (
        <Card className="p-4 shadow-sm border-0 admin-card">
            {/* SECCIÓN 1: GENERADOR DE CÓDIGOS NUEVOS */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Generador Masivo de Códigos</h5>
                <Badge bg="primary">Acceso Root</Badge>
            </div>

            <Form className="mb-4">
                <Row className="g-3">
                    <Col md={7}>
                        <Form.Group>
                            <Form.Label className="small fw-bold">1. Curso a vincular</Form.Label>
                            <Form.Select 
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
                            <Form.Label className="small fw-bold">2. Cantidad</Form.Label>
                            <Form.Control 
                                type="number" 
                                min="1" 
                                max="500"
                                value={seleccion.cantidad} 
                                onChange={e => setSeleccion({...seleccion, cantidad: e.target.value})} 
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Button 
                    className="mt-3 w-100 fw-bold" 
                    variant="dark"
                    onClick={generarCodigos} 
                    disabled={loading || !seleccion.cursoId}
                >
                    {loading ? <Spinner size="sm" className="me-2" /> : null}
                    {loading ? "Generando en Railway..." : "Generar y Guardar en BD"}
                </Button>
            </Form>

            {codigos.length > 0 && (
                <div className="mt-2 mb-5 animate__animated animate__fadeIn">
                    <div className="d-flex justify-content-between align-items-end mb-2">
                        <h6 className="fw-bold mb-0 text-muted-custom">Previsualización:</h6>
                        <Button variant="success" size="sm" onClick={descargarCSV} className="fw-bold">
                            Descargar .CSV para Excel
                        </Button>
                    </div>
                    
                    <div className="custom-scroll border rounded bg-light" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        <Table striped hover responsive className="mb-0 small">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th>Código Generado</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {codigos.map((c, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td><code className="text-primary fw-bold">{c}</code></td>
                                        <td><Badge bg="info" className="text-white">Listo</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}

            <hr className="my-5" />

            {/* SECCIÓN 2: IMPORTADOR DE CÓDIGOS ANTIGUOS (MIGRACIÓN) */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Importar Códigos de Migración</h5>
                <Badge bg="warning" text="dark">Solo formato .xlsx</Badge>
            </div>

            <Form>
                <Row className="g-3 align-items-end">
                    <Col md={9}>
                        <Form.Group>
                            <Form.Label className="small fw-bold">Selecciona el archivo Excel</Form.Label>
                            <Form.Control 
                                type="file" 
                                accept=".xlsx" 
                                onChange={handleFileChange}
                                id="excel-upload-input"
                                disabled={uploadLoading}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Button 
                            variant="success" 
                            className="w-100 fw-bold" 
                            onClick={importarExcel}
                            disabled={!file || uploadLoading}
                        >
                            {uploadLoading ? <Spinner size="sm" className="me-2" /> : null}
                            {uploadLoading ? "Subiendo..." : "Subir Excel"}
                        </Button>
                    </Col>
                </Row>
                <Form.Text className="text-muted-custom">
                    El Excel debe tener la primera fila con los títulos: <strong>Codigo</strong> y <strong>CursoId</strong>.
                </Form.Text>

                {uploadMsg.text && (
                    <Alert variant={uploadMsg.type} className="mt-3 small py-2">
                        {uploadMsg.text}
                    </Alert>
                )}
                
            </Form>

        </Card>
    );
}
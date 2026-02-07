import { useState, useEffect } from "react";
import { Form, Button, Table, Card, Spinner, Row, Col, Badge } from "react-bootstrap";
import api from "../api/axios";

export function RootPanelFC() {
    const [cursos, setCursos] = useState([]);
    const [seleccion, setSeleccion] = useState({ cursoId: "", cantidad: 10 });
    const [codigos, setCodigos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Obtenemos los cursos para el selector
        api.get("/cursos").then(res => setCursos(res.data));
    }, []);

    const generarCodigos = async () => {
        if (!seleccion.cursoId) return;
        setLoading(true);
        try {
            // Tu API usa QueryParams: ?cursoId=X&cantidad=Y
            const res = await api.post(`/codigos/crear?cursoId=${seleccion.cursoId}&cantidad=${seleccion.cantidad}`);
            setCodigos(res.data); // Esperamos array de strings ["ABC123XYZ", ...]
        } catch { 
            alert("Error al conectar con la API de Railway"); 
        } finally { 
            setLoading(false); 
        }
    };

    const descargarCSV = () => {
        if (codigos.length === 0) return;

        // BOM para que Excel no rompa los caracteres
        const BOM = "\uFEFF";
        // Usamos ; como separador para que Excel lo abra en columnas automáticamente
        const contenido = "Indice;Codigo;Estado\n" + 
            codigos.map((c, i) => `${i + 1};${c};Disponible`).join("\n");

        const blob = new Blob([BOM + contenido], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        // Nombre dinámico con la fecha para que no se te mezclen los archivos
        const fecha = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `Codigos_FirstClass_${fecha}.csv`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card className="p-4 shadow-sm border-0 admin-card">
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
                <div className="mt-2 animate__animated animate__fadeIn">
                    <div className="d-flex justify-content-between align-items-end mb-2">
                        <h6 className="fw-bold mb-0 text-muted-custom">Previsualización:</h6>
                        <Button variant="success" size="sm" onClick={descargarCSV} className="fw-bold">
                            Descargar .CSV para Excel
                        </Button>
                    </div>
                    
                    <div className="custom-scroll border rounded bg-light">
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
        </Card>
    );
}

import { useEffect, useState } from "react"
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function PlusMinusButton(props) {

    const [overState, setOverState] = useState('#b5b5b5')
    const [value, setValue] = useState(props.qty)

    useEffect(function () {
        setValue(props.qty)
    }, [props.qty])

    const handlePlus = () => {
        var v = value
        v++
        setValue(v)
        props.onChange(v)
    }

    const handleMinus = () => {
        var v = value
        v--
        setValue(v)
        props.onChange(v)
    }

    return (<div>
        {value == 0 ? <div onMouseLeave={() => setOverState('#b5b5b5')} onClick={handlePlus} onMouseOver={() => setOverState('#1f3d4c')} style={{ cursor: 'pointer', marginTop: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', width: 150, height: 35, border: `0.7px solid ${overState}`, color: '#1f3d4c', fontSize: 16, fontWeight: 'bold', borderRadius: 17.5 }}>

            Add

        </div> :
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 150, height: 35, color: '#1f3d4c', fontSize: 16, fontWeight: 'bold', borderRadius: 17.5 }}>

                <div onClick={handleMinus} style={{ cursor: 'pointer', marginTop: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', width: 35, height: 35, borderRadius: 17.5, border: `0.7px solid ${overState}`, color: '#1f3d4c', fontSize: 16, fontWeight: 'bold' }}><RemoveIcon /></div>
                <div>{value}</div>
                <div onClick={handlePlus} style={{ cursor: 'pointer', background: '#0c5273', marginTop: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', width: 35, height: 35, borderRadius: 17.5, border: `0.7px solid ${overState}`, color: '#ffff', fontSize: 16, fontWeight: 'bold' }}><AddIcon /></div>

            </div>}
    </div >)
}
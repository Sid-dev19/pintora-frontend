import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../../../services/categoryService';
import { supabase } from '../../../config/supabase';

// Remove serverURL as we're using Supabase storage URLs directly

export default function MyDrawer(props) {
    const navigate = useNavigate();
    const [category, setCategory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllCategory = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching categories from Supabase...');
            
            const categories = await fetchCategories();
            console.log('Supabase categories:', categories);
            
            setCategory(Array.isArray(categories) ? categories : []);
            
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load categories. Please try again.');
            setCategory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllCategory();
    }, []);

    // Add real-time subscription for category changes
    useEffect(() => {
        const subscription = supabase
            .channel('categories_changes')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'categories' 
                }, 
                (payload) => {
                    console.log('Categories changed:', payload);
                    fetchAllCategory();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const getImageUrl = (path) => {
        if (!path) return '/default-category.png';
        
        // If it's already a full URL, return as is
        if (path.startsWith('http')) return path;
        
        // If it's a Supabase storage path, get the public URL
        if (path.startsWith('public/')) {
            const { data } = supabase.storage
                .from('categories')  // Your Supabase storage bucket name
                .getPublicUrl(path);
            return data?.publicUrl || '/default-category.png';
        }
        
        // Fallback to the old path structure
        return path.startsWith('/') ? path : `/${path}`;
    };

    const renderCategoryItem = (item) => (
        <ListItem key={item.id || item.categoryid || Math.random()} disablePadding>
            <ListItemButton>
                <ListItemIcon>
                    <img 
                        src={getImageUrl(item.image_url || item.categoryicon)} 
                        alt={item.name || item.categoryname || 'Category'} 
                        style={{ width: 40, height: 40, objectFit: 'contain' }} 
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = '/default-category.png';
                        }}
                    />
                </ListItemIcon>
                <ListItemText primary={item.name || item.categoryname || 'Unnamed Category'} />
            </ListItemButton>
        </ListItem>
    );

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={() => props.setOpen && props.setOpen(false)}>
            <List>
                {loading ? (
                    <ListItem>
                        <ListItemText primary="Loading categories..." />
                    </ListItem>
                ) : error ? (
                    <ListItem>
                        <ListItemText primary={error} />
                    </ListItem>
                ) : Array.isArray(category) && category.length > 0 ? (
                    category.map(renderCategoryItem)
                ) : (
                    <ListItem>
                        <ListItemText primary="No categories available" />
                    </ListItem>
                )}
            </List>

            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        <img 
                            src="/default-category.png" 
                            alt="All Categories"
                            style={{ width: 40, height: 40, objectFit: 'contain' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-category.png';
                            }}
                        />
                    </ListItemIcon>
                    <ListItemText primary="All Categories" />
                </ListItemButton>
            </ListItem>

            <Divider />


            <List>
                <ListItem >
                    <ListItemButton onClick={() => navigate('/signin    ')}>
                        <ListItemIcon>
                            <img src={'/check-out.png'} style={{ width: 40, height: 40 }} />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box >
    );

    return (
        <div>
            <Drawer open={props.open} onClose={() => props.setOpen(false)}>
                {DrawerList}
            </Drawer>
        </div>
    );
}
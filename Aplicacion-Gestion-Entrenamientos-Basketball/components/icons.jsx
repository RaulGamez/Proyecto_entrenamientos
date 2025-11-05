import Foundation from '@expo/vector-icons/Foundation';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export const BoardIcon = (props) => (
    <Foundation name="clipboard" size={24} color="black" {... props}/>
);

export const HomeIcon = (props) => (
    <Foundation name="home" size={24} color="black" {... props}/>
);

export const TeamIcon = (props) => (
    <Foundation name="torsos-all" size={24} color="black" {... props}/>
);

export const PlusIcon = (props) => (
    <Foundation name="plus" size={24} color="black" {... props}/>
);

export const LockIcon = (props) => (
    <Foundation name="lock" size={24} color="black" {... props}/>
);

export const Close = (props) => (
    <FontAwesome name="close" size={24} color="black" {... props}/>
);
import { Modal } from './UI/Modal.js';
import { Map } from './UI/Map.js';
import { getCoordsFromAddress, getAddressFromCoords } from './Utility/Location.js';

class PlaceFinder {
    constructor(){
        const addressForm = document.querySelector('form');
        const locateUserBtn = document.getElementById('locate-btn');
        this.shareBtn = document.getElementById('share-btn');

        locateUserBtn.addEventListener('click', this.locateUserHandler.bind(this));
        this.shareBtn.addEventListener('click', this.sharePlaceHandler);
        addressForm.addEventListener('submit', this.findAddressHandler.bind(this));
    }

    sharePlaceHandler() {
        const sharedLinkInputElement = document.getElementById('share-link');
        if(!navigator.clipboard) {
            sharedLinkInputElement.select();
            return;
        }
        navigator.clipboard.writeText(sharedLinkInputElement.value)
        .then(() => {
            alert("Copied to Clipboard");
        })
        .catch(err => {
            console.log(err);
            sharedLinkInputElement.select();
        })
        ;
    }

    selectPlace(coordinates, address) {
        if(this.map) {
            this.map.render(coordinates);
        }
        else{
            this.map = new Map(coordinates);
        }
        this.shareBtn.disabled = false;
        const sharedLinkInputElement = document.getElementById('share-link');
        sharedLinkInputElement.value = `${location.origin}/my-place/index.html?address=${encodeURI(address)}&lat=${coordinates.lat}&lng=${coordinates.lng}`;

    }

    locateUserHandler() {
        if(!navigator.geolocation) {
            alert('Browser not Supported');
            return;
        }
        const modal = new Modal('loading-modal-content', 'loading Location');
        modal.show();
        navigator.geolocation.getCurrentPosition(
            async successResult => {
            console.log(successResult);
            const coordinates = {
                lat: successResult.coords.latitude,
                lng: successResult.coords.longitude
            };
            const address = await getAddressFromCoords(coordinates);
            modal.hide();
            this.selectPlace(coordinates, address);
        }, error => {
            modal.hide();
            alert("Unable to Locate You");
        });
    }

    async findAddressHandler(event) {
        event.preventDefault();
        const address = event.target.querySelector('input').value;
        if(!address || address.trim().length === 0) {
            alert("Invalid address entered");
            return;
        }
        const modal = new Modal('loading-modal-content', 'loading Location');
        modal.show();
        try{
            const coordinates = await getCoordsFromAddress(address);
            this.selectPlace(coordinates, address);
        }
        catch(err) {
            alert(err.message);
        }
        modal.hide();
    }
}

new PlaceFinder();
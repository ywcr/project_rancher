import Ember from 'ember';
import ThrottledResize from './throttled-resize';

const tableProps = {
  actionsHeight: '60px',
  fixedHeaderHeight: '40px',
};

export default Ember.Mixin.create(ThrottledResize, {
  stickyHeader: true,

  didInsertElement() {
    this._super(...arguments);

    if ( !this.get('stickyHeader') ) {
      return;
    }

    let $offset = Ember.$(this.element).find('> table > thead tr').offset().top;
    this.buildTableWidths();

    if (this.get('showHeader')) {
      Ember.$(this.element).find('> table > thead .fixed-header-actions, > table > thead .fixed-header').css('width', Ember.$(this.element).find('table').outerWidth());
    }

    Ember.$(window).scroll(() => {
      this.updateHeaders($offset);
    });

  },

  willDestroyElement() {
    this._super(...arguments);

    if ( !this.get('stickyHeader') ) {
      return;
    }

    Ember.$(window).unbind('scroll');
  },

  onResize() {
    this._super(...arguments);

    if ( !this.get('stickyHeader') ) {
      return;
    }

    this.buildTableWidths();
  },

  buildTableWidths() {
    if ( !this.get('stickyHeader') ) {
      return;
    }

    let ths = Ember.$(this.element).find('> table > thead tr.fixed-header th');

    Ember.$(this.element).find('> table > thead tr.fixed-header-placeholder th').each((idx, th) => {
      Ember.$(ths[idx]).attr('width', Ember.$(th).outerWidth());
    });

    if (this.get('showHeader')) {
      Ember.$(this.element).find('> table > thead .fixed-header-actions, > table > thead .fixed-header').css({
        'width': Ember.$(this.element).find('table').width(),
      });
    }
  },

  tearDownTableWidths() {
    if ( !this.get('stickyHeader') ) {
      return;
    }

    Ember.$(this.element).find('> table > thead tr.fixed-header th').each((idx, td) => {
      Ember.$(td).removeAttr('width');
    });
  },

  positionHeaders() {
    if ( !this.get('stickyHeader') ) {
      return;
    }

    let $table       = Ember.$(this.element).find('> table');
    let $actionRow   = $table.find('> thead .fixed-header-actions');
    let $fixedHeader = $table.find('> thead tr.fixed-header');
    let showHeader  = this.get('showHeader');

    if (showHeader) {
      $actionRow.css({
        'position': 'fixed',
        'top': 0,
        'height': tableProps.actionsHeight,
      });
    }
    $fixedHeader.css({
      'position': 'fixed',
      'top': showHeader ? tableProps.actionsHeight : 0,
      'height': tableProps.fixedHeaderHeight,
    });

    $table.css({
      'margin-top': (parseInt(tableProps.actionsHeight,10) + parseInt(tableProps.fixedHeaderHeight,10)) + 'px'
    });
  },

  removePositions() {
    if ( !this.get('stickyHeader') ) {
      return;
    }

    let $table       = Ember.$(this.element).find('> table');
    let $actionRow   = $table.find('> thead .fixed-header-actions');
    let $fixedHeader = $table.find('> thead tr.fixed-header');

    if (this.get('showHeader')) {
      $actionRow.css({
        'position': 'relative',
        'top': '',
      });
    }

    $fixedHeader.css({
      'position': '',
      'top': '',
    });
    $table.css({
      'margin-top': ''
    });
    this.buildTableWidths();
  },

  updateHeaders(offset) {
    if ( !this.get('stickyHeader') ) {
      return;
    }

    let $windowScroll   = Ember.$(window).scrollTop();
    let $table          = Ember.$(this.element).find('> table');
    let $floatingHeader = $table.find('> thead tr.fixed-header');
    let $scrollTop      = Ember.$(window).scrollTop();
    let containerBottom = $table.height() + $table.offset().top;

    if ($windowScroll < containerBottom ) {
      if ($scrollTop > offset) {
        this.buildTableWidths();
        this.positionHeaders();
      } else if ($scrollTop <= offset) {
        this.tearDownTableWidths();
        this.removePositions();
      }
    } else {
      if ($floatingHeader.css('position') === 'fixed') {
        this.tearDownTableWidths();
        this.removePositions();
      }
    }
  }
});
